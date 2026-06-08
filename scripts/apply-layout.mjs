#!/usr/bin/env node
// scripts/apply-layout.mjs
// 使用 jsdom 以 DOM 方式安全替换 header/footer 片段
// 特性：
// - 默认 dry-run 预览变更；传入 --write/-w 才会实际写入
// - 支持 --glob 自定义匹配（默认 ['*.html','blog/*.html','es/**/*.html','pt-br/**/*.html','ja/**/*.html','ko/**/*.html','de/**/*.html']）
// - 自动跳过 header.html / footer.html 自身
// - 可选 --backup 对写入文件生成 .bak 时间戳备份

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';
import {
  absoluteUrl,
  fallbackSwitcherUrl,
  fileToUrl,
  findPageById,
  findRouteByFile,
  getDefaultTranslation,
  getPublishedTranslations,
  languagePrefix,
  loadI18nConfig,
  normalizeUrlPath
} from './i18n-utils.mjs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write') || args.includes('-w');
const BACKUP = args.includes('--backup');
const FAIL_ON_CHANGE = args.includes('--fail-on-change');

function getArgAfter(flag, fallback) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const globArg = getArgAfter('--glob', null);
const patterns = globArg ? [globArg] : ['*.html', 'blog/*.html', 'es/**/*.html', 'pt-br/**/*.html', 'ja/**/*.html', 'ko/**/*.html', 'de/**/*.html'];
const skipFiles = new Set([
  '404.html',
  'generate-icons.html',
  'offline.html',
  'progress-preview.html',
  'header.html',
  'footer.html'
]);

const ADSENSE_ACCOUNT_ID = 'ca-pub-3219924658522446';
const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ACCOUNT_ID}`;

function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

async function backupFile(p) {
  if (!WRITE || !BACKUP) return null;
  const dir = path.dirname(p);
  const base = path.basename(p);
  const bak = path.join(dir, `${base}.bak.${ts()}`);
  const buf = await fs.readFile(p);
  await fs.writeFile(bak, buf);
  return bak;
}

async function loadFragment(html) {
  return JSDOM.fragment(html);
}

function selectOnly(elFrag, selector) {
  // 从片段中选取第一个匹配节点并深拷贝；忽略其他兄弟
  const found = elFrag.querySelector(selector);
  return found ? found.cloneNode(true) : null;
}

function collectResourceNodes(elFrag) {
  // 收集片段中除 header/footer 外的 link/script 节点（保持顺序）
  const nodes = [];
  elFrag.childNodes.forEach((n) => {
    if (n.nodeType === 1) {
      const tag = n.tagName.toLowerCase();
      if (tag === 'script' || tag === 'link') {
        nodes.push(n.cloneNode(true));
      }
    }
  });
  return nodes;
}

function removeExistingResources(doc, resNodes) {
  const keys = resNodes.map((n) => {
    const tag = n.tagName.toLowerCase();
    if (tag === 'script') return `script::${n.getAttribute('src') || ''}`;
    if (tag === 'link') return `link::${n.getAttribute('href') || ''}`;
    return '';
  }).filter(Boolean);
  const selector = keys.map((k) => {
    const [tag, attr] = k.split('::');
    if (tag === 'script') return `script[src='${attr}']`;
    if (tag === 'link') return `link[href='${attr}']`;
  }).filter(Boolean).join(',');
  if (!selector) return;
  doc.querySelectorAll(selector).forEach((el) => el.remove());
}

function insertAfter(node, newNodes) {
  let ref = node;
  newNodes.forEach((n) => {
    ref.parentNode.insertBefore(n, ref.nextSibling);
    ref = n;
  });
}

function replaceFirstHeader(doc, headerFrag) {
  const desiredHeader = selectOnly(headerFrag, 'header');
  if (!desiredHeader) return;
  // 移除页面内所有 header，统一插入一处
  Array.from(doc.querySelectorAll('header')).forEach((el) => el.remove());
  const body = doc.body || doc.documentElement;
  if (body) body.insertBefore(desiredHeader, body.firstChild);
  // 处理 header 片段中附带的资源节点：去重后插入 header 之后
  const resNodes = collectResourceNodes(headerFrag);
  if (resNodes.length) {
    removeExistingResources(doc, resNodes);
    const headerNow = doc.querySelector('header');
    if (headerNow) insertAfter(headerNow, resNodes.map((n) => n.cloneNode(true)));
  }
}

function replaceLastFooter(doc, footerFrag) {
  const desiredFooter = selectOnly(footerFrag, 'footer');
  if (!desiredFooter) return;
  // 统一仅保留一处 footer：删除全部后插入
  Array.from(doc.querySelectorAll('footer')).forEach((el) => el.remove());
  const body = doc.body || doc.documentElement;
  if (body) body.appendChild(desiredFooter);
  // 处理 footer 片段中附带的资源节点（如年份脚本）：去重后插入 footer 之后
  const resNodes = collectResourceNodes(footerFrag);
  if (resNodes.length) {
    removeExistingResources(doc, resNodes);
    const footerNow = doc.querySelector('footer');
    if (footerNow) insertAfter(footerNow, resNodes.map((n) => n.cloneNode(true)));
  }
}

// 删除页面内所有“设置年份”相关的内联脚本，交由 footer 片段统一注入
function removeYearScripts(doc) {
  const scripts = Array.from(doc.querySelectorAll('script'));
  scripts.forEach((s) => {
    // 仅处理内联脚本
    if (s.src) return;
    const code = (s.textContent || '').replace(/\s+/g, ' ').toLowerCase();
    if (
      code.includes("getelementbyid('y')") ||
      code.includes('getelementbyid("y")')
    ) {
      // 常见实现均包含 getFullYear 或 new Date()
      if (code.includes('getfullyear') || code.includes('new date()')) {
        s.remove();
      }
    }
  });
}

// 若 <head> 为空但相关标签误入 <body>，尝试回填到 <head>
function repairHeadIfNeeded(doc) {
  const head = doc.head || doc.querySelector('head');
  const body = doc.body || doc.querySelector('body');
  if (!head || !body) return;
  const headHasContent = head.children && head.children.length > 0;
  if (headHasContent) return;
  const selectors = ['meta', 'title', 'link[rel]', 'style'];
  const nodes = Array.from(body.querySelectorAll(selectors.join(',')));
  if (nodes.length === 0) return;
  nodes.forEach((n) => head.appendChild(n));
}

function ensureMeta(doc, selector, createAttrs) {
  const head = doc.head || doc.querySelector('head');
  if (!head) return null;
  let el = head.querySelector(selector);
  if (!el) {
    el = doc.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => el.setAttribute(key, value));
    head.appendChild(el);
  }
  return el;
}

function ensureLink(doc, selector, attrs) {
  const head = doc.head || doc.querySelector('head');
  if (!head) return null;
  let el = head.querySelector(selector);
  if (!el) {
    el = doc.createElement('link');
    head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function ensureScript(doc, selector, attrs) {
  const head = doc.head || doc.querySelector('head');
  if (!head) return null;
  const matches = Array.from(head.querySelectorAll(selector));
  const el = matches.shift() || doc.createElement('script');
  matches.forEach((duplicate) => duplicate.remove());
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, value);
    }
  });
  if (!el.parentNode) head.appendChild(el);
  return el;
}

function updateJsonLd(doc, route, config, canonicalUrl) {
  if (!route) return;
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  scripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent || '{}');
      const items = Array.isArray(data) ? data : [data];
      items.forEach((item) => {
        if (!item || typeof item !== 'object') return;
        item.inLanguage = route.language.htmlLang;
        if (typeof item.url === 'string') item.url = canonicalUrl;
        if (typeof item['@id'] === 'string' && item['@id'].startsWith(config.canonicalHost)) {
          const hash = item['@id'].includes('#') ? item['@id'].slice(item['@id'].indexOf('#')) : '';
          item['@id'] = `${canonicalUrl}${hash}`;
        }
        if (item.mainEntityOfPage && typeof item.mainEntityOfPage === 'object') {
          item.mainEntityOfPage['@id'] = canonicalUrl;
        }
      });
      script.textContent = JSON.stringify(Array.isArray(data) ? items : items[0], null, 2);
    } catch {
      // Keep hand-written JSON-LD if it is not valid JSON.
    }
  });
}

function expectedAlternateLinks(config, route) {
  if (!route || route.translation.noindex || route.page.indexable === false) return [];
  const links = getPublishedTranslations(config, route.page, { indexableOnly: true })
    .map(({ language, translation }) => ({
      hreflang: language.hreflang,
      href: absoluteUrl(config, translation.url)
    }));
  const defaultTranslation = getDefaultTranslation(config, route.page);
  if (defaultTranslation) {
    links.push({
      hreflang: 'x-default',
      href: absoluteUrl(config, defaultTranslation.translation.url)
    });
  }
  return links;
}

function enforceMetadata(doc, filepath, config) {
  const head = doc.head || doc.querySelector('head');
  if (!head) return null;

  const route = findRouteByFile(config, filepath);
  const fallbackPath = fileToUrl(filepath);
  const urlPath = route ? normalizeUrlPath(route.translation.url) : fallbackPath;
  const canonicalUrl = route ? absoluteUrl(config, urlPath) : `${config.canonicalHost}${urlPath === '/' ? '/' : urlPath}`;

  if (route) {
    doc.documentElement.setAttribute('lang', route.language.htmlLang);
  }

  head.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
  ensureLink(doc, 'link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

  head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  expectedAlternateLinks(config, route).forEach((alt) => {
    const link = doc.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', alt.hreflang);
    link.setAttribute('href', alt.href);
    head.appendChild(link);
  });

  const ogUrl = ensureMeta(doc, 'meta[property="og:url"]', { property: 'og:url' });
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

  const adsenseAccount = ensureMeta(doc, 'meta[name="google-adsense-account"]', { name: 'google-adsense-account' });
  if (adsenseAccount) adsenseAccount.setAttribute('content', ADSENSE_ACCOUNT_ID);

  ensureScript(doc, `script[src="${ADSENSE_SCRIPT_SRC}"]`, {
    async: true,
    src: ADSENSE_SCRIPT_SRC,
    crossorigin: 'anonymous'
  });

  if (route) {
    const robots = ensureMeta(doc, 'meta[name="robots"]', { name: 'robots' });
    if (robots) {
      robots.setAttribute('content', route.translation.noindex || route.page.indexable === false ? 'noindex,nofollow' : 'index,follow');
    }
    updateJsonLd(doc, route, config, canonicalUrl);
  }

  return route;
}

function labelsFor(languageKey) {
  if (languageKey === 'es') {
    return {
      home: 'Inicio',
      features: 'Funciones',
      whatIs: 'Qué es',
      howToPlay: 'Cómo jugar',
      whyPlay: 'Por qué jugar',
      faq: 'FAQ',
      blog: 'Blog',
      play: 'Jugar ahora',
      menu: 'Menú',
      skip: 'Saltar al contenido principal',
      about: 'Acerca de',
      legal: 'Legal',
      privacy: 'Privacidad',
      terms: 'Términos',
      dmca: 'DMCA',
      cookie: 'Configurar cookies',
      doNotSell: 'No vender mi información'
    };
  }
  if (languageKey === 'pt-BR') {
    return {
      home: 'Início',
      features: 'Recursos',
      whatIs: 'O que é',
      howToPlay: 'Como jogar',
      whyPlay: 'Por que jogar',
      faq: 'FAQ',
      blog: 'Blog',
      play: 'Jogar agora',
      menu: 'Menu',
      skip: 'Pular para o conteúdo principal',
      about: 'Sobre',
      legal: 'Legal',
      privacy: 'Privacidade',
      terms: 'Termos',
      dmca: 'DMCA',
      cookie: 'Configurar cookies',
      doNotSell: 'Não vender minhas informações'
    };
  }
  if (languageKey === 'ja') {
    return {
      home: 'ホーム',
      features: '特徴',
      whatIs: '概要',
      howToPlay: '遊び方',
      whyPlay: 'おすすめ',
      faq: 'FAQ',
      blog: 'ブログ',
      play: '今すぐプレイ',
      menu: 'メニュー',
      skip: 'メインコンテンツへ移動',
      about: '概要',
      legal: '法的情報',
      privacy: 'プライバシー',
      terms: '利用規約',
      dmca: 'DMCA',
      cookie: 'Cookie設定',
      doNotSell: '個人情報を販売しない'
    };
  }
  if (languageKey === 'ko') {
    return {
      home: '홈',
      features: '특징',
      whatIs: '소개',
      howToPlay: '플레이 방법',
      whyPlay: '추천 이유',
      faq: 'FAQ',
      blog: '블로그',
      play: '지금 플레이',
      menu: '메뉴',
      skip: '본문으로 이동',
      about: '소개',
      legal: '법적 정보',
      privacy: '개인정보',
      terms: '약관',
      dmca: 'DMCA',
      cookie: '쿠키 설정',
      doNotSell: '개인정보 판매 거부'
    };
  }
  if (languageKey === 'de') {
    return {
      home: 'Start',
      features: 'Funktionen',
      whatIs: 'Was ist',
      howToPlay: 'So spielst du',
      whyPlay: 'Warum spielen',
      faq: 'FAQ',
      blog: 'Blog',
      play: 'Jetzt spielen',
      menu: 'Menü',
      skip: 'Zum Hauptinhalt springen',
      about: 'Über uns',
      legal: 'Rechtliches',
      privacy: 'Datenschutz',
      terms: 'Bedingungen',
      dmca: 'DMCA',
      cookie: 'Cookie-Einstellungen',
      doNotSell: 'Meine Daten nicht verkaufen'
    };
  }
  return {
    home: 'Home',
    features: 'Features',
    whatIs: 'What is',
    howToPlay: 'How to Play',
    whyPlay: 'Why Play',
    faq: 'FAQ',
    blog: 'Blog',
    play: 'Play Now',
    menu: 'Menu',
    skip: 'Skip to main content',
    about: 'About',
    legal: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    dmca: 'DMCA',
    cookie: 'Cookie Settings',
    doNotSell: 'Do Not Sell My Info'
  };
}

function setAnchor(anchor, href, text) {
  if (!anchor) return;
  anchor.setAttribute('href', href);
  if (text) anchor.textContent = text;
}

function configuredPageUrl(config, pageId, languageKey, fallback) {
  const page = findPageById(config, pageId);
  const translation = page?.translations?.[languageKey];
  if (translation?.status === 'published' && translation.url) {
    return normalizeUrlPath(translation.url);
  }
  return fallback;
}

function buildLangSwitcher(doc, config, route) {
  if (!route) return null;
  const currentLanguage = config.languages[route.languageKey];
  const isSpanish = route.languageKey === 'es';
  const isPortuguese = route.languageKey === 'pt-BR';
  const isJapanese = route.languageKey === 'ja';
  const isKorean = route.languageKey === 'ko';
  const isGerman = route.languageKey === 'de';
  const wrapper = doc.createElement('nav');
  wrapper.setAttribute('aria-label', isSpanish || isPortuguese ? 'Idioma' : isJapanese ? '言語' : isKorean ? '언어' : isGerman ? 'Sprache' : 'Language');
  wrapper.setAttribute('data-language-switcher', '');
  wrapper.setAttribute('style', 'position:relative;display:flex;align-items:center;font-size:13px');
  wrapper.setAttribute('onmouseenter', "var m=this.querySelector('[data-language-menu]');if(m)m.style.display='block';");
  wrapper.setAttribute('onmouseleave', "var m=this.querySelector('[data-language-menu]');if(m)m.style.display='none';var b=this.querySelector('button');if(b)b.setAttribute('aria-expanded','false');");
  wrapper.setAttribute('onfocusin', "var m=this.querySelector('[data-language-menu]');if(m)m.style.display='block';");
  wrapper.setAttribute('onfocusout', "var t=this;setTimeout(function(){if(!t.contains(document.activeElement)){var m=t.querySelector('[data-language-menu]');if(m)m.style.display='none';var b=t.querySelector('button');if(b)b.setAttribute('aria-expanded','false');}},80);");

  const button = doc.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', isSpanish ? 'Cambiar idioma' : isPortuguese ? 'Alterar idioma' : isJapanese ? '言語を変更' : isKorean ? '언어 변경' : isGerman ? 'Sprache ändern' : 'Change language');
  button.setAttribute('style', 'display:flex;align-items:center;gap:8px;min-width:118px;padding:9px 12px;border:1px solid #dbe3ee;border-radius:8px;background:#fff;color:#0f172a;font-weight:700;line-height:1;cursor:pointer');
  button.setAttribute('onclick', "var m=this.nextElementSibling;var open=m&&m.style.display!=='block';if(m)m.style.display=open?'block':'none';this.setAttribute('aria-expanded',open?'true':'false');event.stopPropagation();");
  const label = doc.createElement('span');
  label.textContent = currentLanguage.label;
  const caret = doc.createElement('span');
  caret.setAttribute('aria-hidden', 'true');
  caret.setAttribute('style', 'width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid #475569');
  button.appendChild(label);
  button.appendChild(caret);
  wrapper.appendChild(button);

  const menu = doc.createElement('div');
  menu.setAttribute('data-language-menu', '');
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('style', 'display:none;position:absolute;right:0;top:calc(100% + 8px);min-width:150px;padding:6px;border:1px solid #dbe3ee;border-radius:8px;background:#fff;box-shadow:0 12px 30px rgba(15,23,42,.16);z-index:80');

  Object.entries(config.languages)
    .filter(([, language]) => language.enabled)
    .forEach(([languageKey, language]) => {
      const href = fallbackSwitcherUrl(config, route.page, languageKey);
      if (!href) return;
      const link = doc.createElement('a');
      link.setAttribute('href', href);
      link.setAttribute('hreflang', language.hreflang);
      link.setAttribute('role', 'option');
      link.setAttribute('aria-selected', languageKey === route.languageKey ? 'true' : 'false');
      if (languageKey === route.languageKey) link.setAttribute('aria-current', 'page');
      link.setAttribute('style', languageKey === route.languageKey
        ? 'display:block;padding:9px 10px;border-radius:6px;background:#e0f2fe;color:#0369a1;font-weight:700;text-decoration:none;white-space:nowrap'
        : 'display:block;padding:9px 10px;border-radius:6px;color:#334155;text-decoration:none;white-space:nowrap');
      link.textContent = language.label;
      menu.appendChild(link);
    });

  wrapper.appendChild(menu);
  return menu.childNodes.length ? wrapper : null;
}

function localizeChrome(doc, route, config) {
  const languageKey = route ? route.languageKey : 'en';
  const language = route ? route.language : config.languages.en;
  const prefix = languagePrefix(language);
  const labels = labelsFor(languageKey);
  const home = configuredPageUrl(config, 'home', languageKey, prefix || '/');
  const blog = configuredPageUrl(config, 'blog-index', languageKey, prefix ? `${prefix}/blog/` : '/blog/');
  const hashPrefix = home;

  const logo = doc.querySelector('header a[aria-label]');
  if (logo) logo.setAttribute('href', home);

  const desktopLinks = Array.from(doc.querySelectorAll('header nav:not([data-language-switcher]) a'));
  const navMap = [
    [home, labels.home],
    [`${hashPrefix}#features`, labels.features],
    [`${hashPrefix}#what-is`, labels.whatIs],
    [`${hashPrefix}#how-to-play`, labels.howToPlay],
    [`${hashPrefix}#why-play`, labels.whyPlay],
    [`${hashPrefix}#faq`, labels.faq],
    [blog, labels.blog]
  ];
  desktopLinks.forEach((anchor, index) => {
    if (navMap[index]) setAnchor(anchor, navMap[index][0], navMap[index][1]);
  });

  const playLinks = Array.from(doc.querySelectorAll('header a')).filter((a) => {
    const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
    const href = a.getAttribute('href') || '';
    return href.includes('#play') || text === 'Play Now' || text === 'Jugar ahora' || text === 'Jogar agora' || text === '今すぐプレイ' || text === '지금 플레이' || text === 'Jetzt spielen';
  });
  playLinks.forEach((anchor) => setAnchor(anchor, `${hashPrefix}#play`, labels.play));

  const button = doc.querySelector('#nav-toggle');
  if (button) {
    button.textContent = labels.menu;
    button.setAttribute('aria-label', languageKey === 'es' ? 'Abrir menú de navegación' : languageKey === 'pt-BR' ? 'Abrir menu de navegação' : languageKey === 'ja' ? 'ナビゲーションメニューを開く' : languageKey === 'ko' ? '탐색 메뉴 열기' : languageKey === 'de' ? 'Navigationsmenü öffnen' : 'Toggle navigation menu');
  }

  const mobileLinks = Array.from(doc.querySelectorAll('#nav-mobile a'));
  const mobileMap = [...navMap, [`${hashPrefix}#play`, labels.play]];
  mobileLinks.forEach((anchor, index) => {
    if (mobileMap[index]) setAnchor(anchor, mobileMap[index][0], mobileMap[index][1]);
  });

  doc.querySelectorAll('[data-language-switcher]').forEach((el) => el.remove());
  const switcher = buildLangSwitcher(doc, config, route);
  const headerControls = doc.querySelector('header div[style*="gap: 16px"]') || doc.querySelector('header div[style*="gap:16px"]');
  if (switcher && headerControls) {
    headerControls.insertBefore(switcher, headerControls.lastElementChild || null);
  }

  const skip = Array.from(doc.querySelectorAll('a[href="#main-content"]')).find((a) => /Skip|Saltar|Pular|メインコンテンツ|본문|Hauptinhalt/.test(a.textContent || ''));
  if (skip) skip.textContent = labels.skip;

  const footerLinks = Array.from(doc.querySelectorAll('footer nav a'));
  const footerMap = [
    [`${prefix}/about-us`, labels.about],
    [`${prefix}/legal-documents`, labels.legal],
    [`${prefix}/privacy-policy`, labels.privacy],
    [`${prefix}/terms-of-service`, labels.terms],
    [`${prefix}/dmca`, labels.dmca]
  ];
  footerLinks.forEach((anchor, index) => {
    if (footerMap[index]) setAnchor(anchor, footerMap[index][0], footerMap[index][1]);
  });

  const cookieLink = Array.from(doc.querySelectorAll('footer a')).find((a) => /Cookie Settings|Configurar cookies|Cookie設定|쿠키 설정|Cookie-Einstellungen/.test(a.textContent || ''));
  if (cookieLink) cookieLink.textContent = labels.cookie;
  const doNotSell = Array.from(doc.querySelectorAll('footer a')).find((a) => /Do Not Sell|No vender|Não vender|個人情報|개인정보|Meine Daten/.test(a.textContent || ''));
  if (doNotSell) {
    setAnchor(doNotSell, `${prefix}/privacy-policy#ccpa`, labels.doNotSell);
  }
}

// 移除 Git 合并冲突标记与被转义的 footer 文本块
function stripMarkersAndEscapedFooter(htmlText) {
  let out = htmlText;
  // 移除冲突标记行
  out = out.replace(/^<<<<<<<.*$/gm, '');
  out = out.replace(/^=======$/gm, '');
  out = out.replace(/^>>>>>>>.*$/gm, '');
  // 移除被 HTML 转义的 footer 片段（&lt;footer ... &lt;/footer&gt;）
  out = out.replace(/&lt;footer[\s\S]*?&lt;\/footer&gt;/gi, '');
  // 移除被 HTML 转义的合并冲突块（从 &lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD 到 &gt;&gt;&gt;&gt;&gt;&gt;&gt; 行）
  out = out.replace(/(?:&lt;){7}\s*HEAD[\s\S]*?(?:&gt;){7}[^\n]*\n?/gi, '');
  // 补充：移除孤立的被转义标记行
  out = out.replace(/^(?:&lt;){7}.*$/gmi, '');
  out = out.replace(/^(?:&gt;){7}.*$/gmi, '');
  // 清理被转义的内联年份脚本片段
  out = out.replace(/&lt;script[\s\S]*?getelementbyid\(['\"]y['\"][\s\S]*?&lt;\/script&gt;/gi, '');
  return out;
}

async function main() {
  const i18nConfig = await loadI18nConfig();
  const headerHTML = await fs.readFile('header.html', 'utf8');
  const footerHTML = await fs.readFile('footer.html', 'utf8');
  const headerFrag = await loadFragment(headerHTML);
  const footerFrag = await loadFragment(footerHTML);

  const files = await globby(patterns, { gitignore: true, expandDirectories: false });
  const targets = files.filter((f) => !skipFiles.has(f));

  let changed = 0;
  for (const file of targets) {
    const html = await fs.readFile(file, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // 先移除页面内所有年份脚本，由 footer 统一注入
    removeYearScripts(document);
    replaceFirstHeader(document, headerFrag);
    replaceLastFooter(document, footerFrag);
    repairHeadIfNeeded(document);
    const route = enforceMetadata(document, file, i18nConfig);
    localizeChrome(document, route, i18nConfig);

    let out = dom.serialize();
    out = stripMarkersAndEscapedFooter(out);
    // 确保 DOCTYPE 存在
    if (!/^<!DOCTYPE html>/i.test(out.trimStart())) {
      out = '<!DOCTYPE html>' + out;
    }
    if (out !== html) {
      changed++;
      if (WRITE) {
        await backupFile(file);
        await fs.writeFile(file, out, 'utf8');
        console.log('Applied:', file);
      } else {
        console.log('Will apply:', file);
      }
    } else {
      console.log('No change:', file);
    }
  }
  const mode = WRITE ? 'Applied' : 'Planned';
  console.log(`Done. ${mode} changes: ${changed}`);
  if (!WRITE && FAIL_ON_CHANGE && changed > 0) {
    console.error('[apply-layout] Found files needing layout application. Run: npm run apply:layout:write');
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e && e.stack ? e.stack : e);
  process.exit(1);
});

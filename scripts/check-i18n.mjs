#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  absoluteUrl,
  findRouteByFile,
  getDefaultTranslation,
  getPublishedTranslations,
  loadI18nConfig
} from './i18n-utils.mjs';

const SPANISH_HINTS = /\b(jugar|pistas?|editor|gu[ií]a|gratis|carrera|consejos|blog|privacidad|t[eé]rminos|aviso|espa[nñ]ol)\b/i;
const PORTUGUESE_HINTS = /\b(jogar|pistas?|editor|guia|gr[aá]tis|corrida|dicas|blog|privacidade|termos|aviso|portugu[eê]s|sobre|criar)\b/i;
const JAPANESE_HINTS = /[ぁ-んァ-ン一-龯]/;
const CJK = /[\u3400-\u9fff]/;

function cleanUrlForDoubleSlash(url) {
  return url.replace(/^https?:\/\//, '');
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function getMeta(doc, selector, attr = 'content') {
  const el = doc.querySelector(selector);
  return el ? el.getAttribute(attr) || '' : '';
}

function h1Text(doc) {
  const h1 = doc.querySelector('h1');
  return h1 ? h1.textContent.trim() : '';
}

function expectedAlternates(config, page) {
  const links = getPublishedTranslations(config, page, { indexableOnly: true })
    .map(({ language, translation }) => `${language.hreflang} ${absoluteUrl(config, translation.url)}`);
  const defaultTranslation = getDefaultTranslation(config, page);
  if (defaultTranslation) {
    links.push(`x-default ${absoluteUrl(config, defaultTranslation.translation.url)}`);
  }
  return links.sort();
}

async function main() {
  const config = await loadI18nConfig();
  const errors = [];

  for (const page of config.pages || []) {
    for (const [languageKey, translation] of Object.entries(page.translations || {})) {
      if (translation.status !== 'published') continue;

      let html;
      try {
        html = await fs.readFile(translation.file, 'utf8');
      } catch {
        errors.push(`${translation.file}: configured as published but file is missing`);
        continue;
      }

      const route = findRouteByFile(config, translation.file);
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      const language = config.languages[languageKey];
      const canonical = absoluteUrl(config, translation.url);

      assert(route && route.page.id === page.id, `${translation.file}: file is not mapped back to page ${page.id}`, errors);
      assert(doc.documentElement.getAttribute('lang') === language.htmlLang, `${translation.file}: html lang should be ${language.htmlLang}`, errors);
      assert(getMeta(doc, 'link[rel="canonical"]', 'href') === canonical, `${translation.file}: canonical should be ${canonical}`, errors);
      assert(getMeta(doc, 'meta[property="og:url"]') === canonical, `${translation.file}: og:url should be ${canonical}`, errors);

      const robots = getMeta(doc, 'meta[name="robots"]').replace(/\s+/g, '').toLowerCase();
      if (translation.noindex || page.indexable === false) {
        assert(robots.includes('noindex'), `${translation.file}: noindex page must include noindex robots`, errors);
      } else {
        assert(!robots.includes('noindex'), `${translation.file}: indexable page should not include noindex robots`, errors);
      }

      const urlFields = [
        ['canonical', getMeta(doc, 'link[rel="canonical"]', 'href')],
        ['og:url', getMeta(doc, 'meta[property="og:url"]')]
      ];
      for (const [label, value] of urlFields) {
        assert(!value.includes('.html'), `${translation.file}: ${label} contains .html`, errors);
        assert(!cleanUrlForDoubleSlash(value).includes('//'), `${translation.file}: ${label} contains double slash`, errors);
      }

      const actualAlternates = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]'))
        .map((el) => `${el.getAttribute('hreflang')} ${el.getAttribute('href')}`)
        .sort();

      if (!translation.noindex && page.indexable !== false) {
        const expected = expectedAlternates(config, page);
        assert(JSON.stringify(actualAlternates) === JSON.stringify(expected), `${translation.file}: hreflang set does not match config`, errors);
      } else {
        assert(actualAlternates.length === 0, `${translation.file}: noindex page should not have hreflang alternates`, errors);
      }

      const title = doc.querySelector('title')?.textContent || '';
      const desc = getMeta(doc, 'meta[name="description"]');
      const h1 = h1Text(doc);
      assert(title && desc && h1, `${translation.file}: title, description, and H1 are required`, errors);

      if (languageKey === 'es' && !translation.noindex) {
        const combined = `${title} ${desc} ${h1}`;
        assert(SPANISH_HINTS.test(combined), `${translation.file}: Spanish page does not look localized enough`, errors);
      }

      if (languageKey === 'pt-BR' && !translation.noindex) {
        const combined = `${title} ${desc} ${h1}`;
        assert(PORTUGUESE_HINTS.test(combined), `${translation.file}: Portuguese page does not look localized enough`, errors);
      }

      if (languageKey === 'ja' && !translation.noindex) {
        const combined = `${title} ${desc} ${h1}`;
        assert(JAPANESE_HINTS.test(combined), `${translation.file}: Japanese page does not look localized enough`, errors);
      }

      if (languageKey === 'en') {
        assert(doc.documentElement.getAttribute('lang') !== 'zh-Hans', `${translation.file}: English file still has zh-Hans`, errors);
        assert(!CJK.test(`${title} ${desc} ${h1}`), `${translation.file}: English title/description/H1 still contains CJK text`, errors);
      }
    }
  }

  if (errors.length) {
    console.error(`[check-i18n] Failed with ${errors.length} issue(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log('[check-i18n] OK');
}

main().catch((error) => {
  console.error('[check-i18n] Failed:', error && error.stack ? error.stack : error);
  process.exit(1);
});

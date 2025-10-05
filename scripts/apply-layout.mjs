#!/usr/bin/env node
// scripts/apply-layout.mjs
// 使用 jsdom 以 DOM 方式安全替换 header/footer 片段
// 特性：
// - 默认 dry-run 预览变更；传入 --write/-w 才会实际写入
// - 支持 --glob 自定义匹配（默认 ['*.html','blog/*.html']）
// - 自动跳过 header.html / footer.html 自身
// - 可选 --backup 对写入文件生成 .bak 时间戳备份

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';

const args = process.argv.slice(2);
const WRITE = args.includes('--write') || args.includes('-w');
const BACKUP = args.includes('--backup');
const FAIL_ON_CHANGE = args.includes('--fail-on-change');

function getArgAfter(flag, fallback) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const globArg = getArgAfter('--glob', null);
const patterns = globArg ? [globArg] : ['*.html', 'blog/*.html'];

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
  const h = doc.querySelector('header');
  if (h) {
    h.replaceWith(desiredHeader);
  } else {
    const body = doc.body || doc.documentElement;
    if (body) body.insertBefore(desiredHeader, body.firstChild);
  }
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
  const footers = Array.from(doc.querySelectorAll('footer'));
  if (footers.length > 0) {
    footers[footers.length - 1].replaceWith(desiredFooter);
  } else {
    const body = doc.body || doc.documentElement;
    if (body) body.appendChild(desiredFooter);
  }
}

async function main() {
  const headerHTML = await fs.readFile('header.html', 'utf8');
  const footerHTML = await fs.readFile('footer.html', 'utf8');
  const headerFrag = await loadFragment(headerHTML);
  const footerFrag = await loadFragment(footerHTML);

  const files = await globby(patterns, { gitignore: true, expandDirectories: false });
  const targets = files.filter((f) => !/\b(header|footer)\.html$/i.test(f));

  let changed = 0;
  for (const file of targets) {
    const html = await fs.readFile(file, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    replaceFirstHeader(document, headerFrag);
    replaceLastFooter(document, footerFrag);

    const out = dom.serialize();
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

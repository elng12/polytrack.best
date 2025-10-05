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
  // 使用 JSDOM.fragment 解析片段
  return JSDOM.fragment(html);
}

function replaceFirstHeader(doc, headerFrag) {
  const h = doc.querySelector('header');
  const frag = headerFrag.cloneNode(true);
  if (h) {
    h.replaceWith(frag);
  } else {
    const body = doc.body || doc.documentElement;
    if (body) body.insertBefore(frag, body.firstChild);
  }
}

function replaceLastFooter(doc, footerFrag) {
  const footers = Array.from(doc.querySelectorAll('footer'));
  const frag = footerFrag.cloneNode(true);
  if (footers.length > 0) {
    footers[footers.length - 1].replaceWith(frag);
  } else {
    const body = doc.body || doc.documentElement;
    if (body) body.appendChild(frag);
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

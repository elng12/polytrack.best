#!/usr/bin/env node
// scripts/gen-cache-manifest.mjs
// 生成用于 Service Worker 预缓存的资源清单
// 输出: assets/cache-manifest.json

import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { globby } from 'globby';

const PROJECT_ROOT = process.cwd();
const OUT_PATH = path.join(PROJECT_ROOT, 'assets', 'cache-manifest.json');

function toPublicPath(absPath) {
  const rel = path.relative(PROJECT_ROOT, absPath);
  // 统一使用 POSIX 分隔符，前置 '/'
  const publicPath = '/' + rel.split(path.sep).join('/');
  if (publicPath === '/index.html') return '/';
  if (publicPath.endsWith('/index.html')) return publicPath.slice(0, -10) + '/';
  if (publicPath.endsWith('.html')) return publicPath.slice(0, -5);
  return publicPath;
}

async function contentVersion(files, publicPaths) {
  const hash = crypto.createHash('sha256');
  const entries = files
    .map((file, index) => ({ file, publicPath: publicPaths[index] }))
    .sort((a, b) => a.publicPath.localeCompare(b.publicPath));

  for (const entry of entries) {
    const bytes = await fs.readFile(entry.file);
    hash.update(entry.publicPath);
    hash.update('\0');
    hash.update(bytes);
    hash.update('\0');
  }

  return `v-${hash.digest('hex').slice(0, 16)}`;
}

async function main() {
  // 需要缓存的模式：根目录 HTML、blog 下 HTML、关键文本文件、assets 静态资源
  const patterns = [
    '*.html',
    'blog/**/*.html',
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
    'ads.txt',
    'sw.js',
    'assets/**/*.{css,js,svg,png,jpg,jpeg,webmanifest,woff2,ico}',
  ];

  const files = await globby(patterns, { gitignore: true, expandDirectories: false, absolute: true });
  const skip = new Set([
    'generate-icons.html',
    'header.html',
    'footer.html',
    'index_html_lines.txt',
    'progress-preview.html',
    'sw-verify.js',
  ]);

  let cacheFiles = files.filter((f) => !skip.has(path.basename(f)) && !/\.bak(?:\.|$)/.test(f));

  // 强制确保常用样式存在于清单（避免被 .gitignore 影响的遗漏）
  const ensureList = ['/assets/styles.css'];
  for (const p of ensureList) {
    try {
      const abs = path.join(PROJECT_ROOT, p);
      await fs.access(abs);
      if (!cacheFiles.includes(abs)) cacheFiles.push(abs);
    } catch {}
  }

  const publicPaths = cacheFiles.map((f) => toPublicPath(f));
  let staticFiles = Array.from(new Set(publicPaths)).sort((a, b) => a.localeCompare(b));

  // 将根路径 '/' 放在首位，确保导航可用
  if (!staticFiles.includes('/')) staticFiles.unshift('/');
  if (!staticFiles.includes('/offline')) staticFiles.push('/offline');

  const manifest = {
    version: await contentVersion(cacheFiles, publicPaths),
    staticFiles,
  };

  // 写入输出
  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[gen-cache-manifest] Wrote ${OUT_PATH}`);
  console.log(`[gen-cache-manifest] version=${manifest.version}, files=${manifest.staticFiles.length}`);
}

main().catch((e) => {
  console.error('[gen-cache-manifest] Failed:', e && e.stack ? e.stack : e);
  process.exit(1);
});

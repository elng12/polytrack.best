#!/usr/bin/env node

import { promises as fs } from 'node:fs';

function hasDoubleSlash(value) {
  return value.replace(/^https?:\/\//, '').includes('//');
}

async function main() {
  const raw = await fs.readFile('assets/cache-manifest.json', 'utf8');
  const manifest = JSON.parse(raw);
  const files = manifest.staticFiles || [];
  const errors = [];
  const seen = new Set();

  if (!manifest.version) errors.push('manifest.version is missing');
  if (!Array.isArray(files)) errors.push('manifest.staticFiles must be an array');

  for (const file of files) {
    if (seen.has(file)) errors.push(`duplicate URL: ${file}`);
    seen.add(file);
    if (file.includes('.html')) errors.push(`URL contains .html: ${file}`);
    if (hasDoubleSlash(file)) errors.push(`URL contains double slash: ${file}`);
    if (file !== '/' && file.length > 1 && file.endsWith('/')) errors.push(`URL uses trailing slash: ${file}`);
    if (file === '/es/' || file === '/es/blog/' || file === '/blog/') errors.push(`non-final URL in cache manifest: ${file}`);
    if (!file.startsWith('/')) errors.push(`URL must start with /: ${file}`);
  }

  const longPrecacheHtml = files.filter((file) => {
    if (file === '/offline') return false;
    if (file.startsWith('/assets/')) return false;
    return !/\.(css|js|json|svg|png|jpg|jpeg|webmanifest|woff2|ico|txt|xml)$/i.test(file);
  });
  if (longPrecacheHtml.length) {
    errors.push(`HTML-like pages should not be long-precached: ${longPrecacheHtml.join(', ')}`);
  }

  if (errors.length) {
    console.error(`[check-cache] Failed with ${errors.length} issue(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('[check-cache] OK');
}

main().catch((error) => {
  console.error('[check-cache] Failed:', error && error.stack ? error.stack : error);
  process.exit(1);
});

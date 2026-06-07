#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { absoluteUrl, getDefaultTranslation, getPublishedTranslations, loadI18nConfig } from './i18n-utils.mjs';

function stripProtocol(value) {
  return value.replace(/^https?:\/\//, '');
}

function parseUrlBlocks(xml) {
  return Array.from(xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)).map((match) => match[1]);
}

function firstMatch(block, pattern) {
  const match = block.match(pattern);
  return match ? match[1].trim() : '';
}

function altSet(block) {
  return Array.from(block.matchAll(/<xhtml:link\s+[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*\/>/g))
    .map((match) => `${match[1]} ${match[2]}`)
    .sort();
}

function expectedAlternates(config, page) {
  const alternates = getPublishedTranslations(config, page, { indexableOnly: true })
    .map(({ language, translation }) => `${language.hreflang} ${absoluteUrl(config, translation.url)}`);
  const defaultTranslation = getDefaultTranslation(config, page);
  if (defaultTranslation) {
    alternates.push(`x-default ${absoluteUrl(config, defaultTranslation.translation.url)}`);
  }
  return alternates.sort();
}

async function main() {
  const [config, xml] = await Promise.all([
    loadI18nConfig(),
    fs.readFile('sitemap.xml', 'utf8')
  ]);
  const errors = [];
  const blocks = parseUrlBlocks(xml);
  const byLoc = new Map();

  if (!xml.includes('xmlns:xhtml=')) errors.push('sitemap is missing xmlns:xhtml');

  for (const block of blocks) {
    const loc = firstMatch(block, /<loc>\s*([^<]+)\s*<\/loc>/);
    if (!loc) {
      errors.push('url block is missing loc');
      continue;
    }
    if (byLoc.has(loc)) errors.push(`duplicate sitemap loc: ${loc}`);
    byLoc.set(loc, block);
    if (loc.includes('.html')) errors.push(`loc contains .html: ${loc}`);
    if (stripProtocol(loc).includes('//')) errors.push(`loc contains double slash: ${loc}`);
    if (loc !== `${config.canonicalHost}/` && loc.endsWith('/')) errors.push(`loc uses trailing slash: ${loc}`);
  }

  const expectedLocs = [];
  for (const page of config.pages || []) {
    for (const item of getPublishedTranslations(config, page, { sitemapOnly: true })) {
      const loc = absoluteUrl(config, item.translation.url);
      expectedLocs.push(loc);
      const block = byLoc.get(loc);
      if (!block) {
        errors.push(`missing sitemap loc: ${loc}`);
        continue;
      }
      const lastmod = firstMatch(block, /<lastmod>\s*([^<]+)\s*<\/lastmod>/);
      const expectedLastmod = item.translation.lastmod || page.lastmod;
      if (lastmod !== expectedLastmod) errors.push(`${loc}: lastmod should be ${expectedLastmod}`);
      const actualAlt = altSet(block);
      const expectedAlt = expectedAlternates(config, page);
      if (JSON.stringify(actualAlt) !== JSON.stringify(expectedAlt)) {
        errors.push(`${loc}: alternate links do not match config`);
      }
    }
  }

  for (const loc of byLoc.keys()) {
    if (!expectedLocs.includes(loc)) errors.push(`unexpected sitemap loc: ${loc}`);
  }

  if (errors.length) {
    console.error(`[check:sitemap] Failed with ${errors.length} issue(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`[check:sitemap] OK (${expectedLocs.length} URLs)`);
}

main().catch((error) => {
  console.error('[check:sitemap] Failed:', error && error.stack ? error.stack : error);
  process.exit(1);
});

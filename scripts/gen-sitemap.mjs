#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { absoluteUrl, getDefaultTranslation, getPublishedTranslations, loadI18nConfig } from './i18n-utils.mjs';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(config, page, languageKey, translation) {
  const loc = absoluteUrl(config, translation.url);
  const alternates = getPublishedTranslations(config, page, { indexableOnly: true });
  const defaultTranslation = getDefaultTranslation(config, page);
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${escapeXml(translation.lastmod || page.lastmod)}</lastmod>`
  ];

  for (const alternate of alternates) {
    lines.push(`    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.language.hreflang)}" href="${escapeXml(absoluteUrl(config, alternate.translation.url))}" />`);
  }
  if (defaultTranslation) {
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(config, defaultTranslation.translation.url))}" />`);
  }

  if (page.changefreq) lines.push(`    <changefreq>${escapeXml(page.changefreq)}</changefreq>`);
  if (page.priority !== undefined) lines.push(`    <priority>${escapeXml(page.priority.toFixed ? page.priority.toFixed(1) : page.priority)}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

async function main() {
  const config = await loadI18nConfig();
  const entries = [];

  for (const page of config.pages || []) {
    for (const item of getPublishedTranslations(config, page, { sitemapOnly: true })) {
      entries.push(urlEntry(config, page, item.languageKey, item.translation));
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '',
    entries.join('\n\n'),
    '',
    '</urlset>',
    ''
  ].join('\n');

  await fs.writeFile('sitemap.xml', xml, 'utf8');
  console.log(`[gen-sitemap] Wrote sitemap.xml with ${entries.length} URLs`);
}

main().catch((error) => {
  console.error('[gen-sitemap] Failed:', error && error.stack ? error.stack : error);
  process.exit(1);
});

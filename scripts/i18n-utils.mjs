import { promises as fs } from 'node:fs';
import path from 'node:path';

export const CONFIG_PATH = path.join(process.cwd(), 'data', 'i18n-pages.json');

export async function loadI18nConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

export function normalizeSlashes(value) {
  return value.replace(/\/{2,}/g, '/');
}

export function normalizeUrlPath(value) {
  if (!value || value === '/') return '/';
  let out = value.trim();
  if (!out.startsWith('/')) out = `/${out}`;
  out = normalizeSlashes(out);
  if (out.endsWith('/index.html')) out = out.slice(0, -11);
  if (out.endsWith('.html')) out = out.slice(0, -5);
  if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out || '/';
}

export function fileToUrl(file) {
  const normalized = file.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return normalizeUrlPath(normalized.slice(0, -11));
  return normalizeUrlPath(normalized);
}

export function absoluteUrl(config, urlPath) {
  const pathPart = normalizeUrlPath(urlPath);
  return `${config.canonicalHost}${pathPart === '/' ? '/' : pathPart}`;
}

export function findRouteByFile(config, file) {
  const normalizedFile = file.split(path.sep).join('/');
  for (const page of config.pages || []) {
    for (const [languageKey, translation] of Object.entries(page.translations || {})) {
      if (translation.file === normalizedFile) {
        return {
          page,
          languageKey,
          language: config.languages[languageKey],
          translation
        };
      }
    }
  }
  return null;
}

export function isTranslationPublished(config, page, languageKey, options = {}) {
  const language = config.languages[languageKey];
  const translation = page.translations && page.translations[languageKey];
  if (!language || !language.enabled || !translation) return false;
  if (translation.status !== 'published') return false;
  if (options.indexableOnly && (translation.noindex || page.indexable === false)) return false;
  if (options.sitemapOnly && (translation.noindex || page.indexable === false || page.inSitemap === false)) return false;
  if (options.switcherOnly && translation.includeInLanguageSwitcher !== true) return false;
  return true;
}

export function getPublishedTranslations(config, page, options = {}) {
  return Object.keys(page.translations || {})
    .filter((languageKey) => isTranslationPublished(config, page, languageKey, options))
    .map((languageKey) => ({
      languageKey,
      language: config.languages[languageKey],
      translation: page.translations[languageKey]
    }));
}

export function getDefaultTranslation(config, page) {
  const languageKey = config.xDefault || 'en';
  const translation = page.translations && page.translations[languageKey];
  if (!translation) return null;
  return { languageKey, language: config.languages[languageKey], translation };
}

export function findPageById(config, id) {
  return (config.pages || []).find((page) => page.id === id) || null;
}

export function languagePrefix(language) {
  return language && language.prefix ? language.prefix : '';
}

export function fallbackSwitcherUrl(config, page, targetLanguageKey) {
  if (page && page.translations && page.translations[targetLanguageKey]) {
    const direct = page.translations[targetLanguageKey];
    if (direct.status === 'published' && direct.includeInLanguageSwitcher) {
      return direct.url;
    }
  }

  const targetLanguage = config.languages[targetLanguageKey];
  if (!targetLanguage || !targetLanguage.enabled) return null;

  if (page && page.type === 'blog') {
    const blogIndex = findPageById(config, 'blog-index');
    const blogTranslation = blogIndex && blogIndex.translations[targetLanguageKey];
    if (blogTranslation && blogTranslation.status === 'published') return blogTranslation.url;
  }

  const home = findPageById(config, 'home');
  const homeTranslation = home && home.translations[targetLanguageKey];
  if (homeTranslation && homeTranslation.status === 'published') return homeTranslation.url;
  return targetLanguage.prefix || '/';
}

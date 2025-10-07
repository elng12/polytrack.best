// Service Worker for Polytrack.best
// Version derived from assets/cache-manifest.json

const CACHE_PREFIX = 'polytrack';
const FALLBACK_STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/styles.css',
  '/assets/logo.svg',
  '/manifest.json',
  '/sw.js'
];

let cacheVersion = 'v1.0.0';
let staticCacheName = `${CACHE_PREFIX}-static-${cacheVersion}`;
let dynamicCacheName = `${CACHE_PREFIX}-dynamic-${cacheVersion}`;
let precachePaths = new Set(FALLBACK_STATIC_FILES);

// External resources to cache dynamically
const EXTERNAL_RESOURCES = [
  'https://app-polytrack.kodub.com/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

function normalizePath(p) {
  if (typeof p !== 'string') return null;
  const trimmed = p.trim();
  if (!trimmed) return null;
  if (trimmed === '/') return '/';
  return trimmed.startsWith('/') ? trimmed.replace(/\/{2,}/g, '/')
    : `/${trimmed.replace(/^\/+/, '')}`;
}

function mergePrecachePaths(paths) {
  const next = new Set(FALLBACK_STATIC_FILES);
  if (Array.isArray(paths)) {
    paths.forEach((item) => {
      const normalized = normalizePath(item);
      if (normalized) next.add(normalized);
    });
  }
  precachePaths = next;
}

async function loadCacheManifest() {
  try {
    const res = await fetch('/assets/cache-manifest.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const manifest = await res.json();
    if (manifest && manifest.version) {
      cacheVersion = manifest.version;
      staticCacheName = `${CACHE_PREFIX}-static-${cacheVersion}`;
      dynamicCacheName = `${CACHE_PREFIX}-dynamic-${cacheVersion}`;
    }
    if (manifest && Array.isArray(manifest.staticFiles)) {
      mergePrecachePaths(manifest.staticFiles);
    } else {
      mergePrecachePaths([]);
    }
  } catch (error) {
    console.warn('[SW] Failed to load cache-manifest.json:', error?.message || error);
    mergePrecachePaths([]);
  }
}

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil((async () => {
    try {
      await loadCacheManifest();
      const cache = await caches.open(staticCacheName);
      const targets = Array.from(precachePaths);
      console.log('[SW] Caching static files:', staticCacheName, 'items:', targets.length);
      for (const url of targets) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          await cache.put(url, res.clone());
        } catch (e) {
          console.warn('[SW] Failed to cache:', url, e?.message || e);
        }
      }
      console.log('[SW] Static cache prepared:', staticCacheName);
      await self.skipWaiting();
    } catch (error) {
      console.error('[SW] Failed during install:', error);
    }
  })());
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil((async () => {
    try {
      await loadCacheManifest();
      const keys = await caches.keys();
      const deletions = keys.map((cacheName) => {
        const isPolytrackCache = cacheName.startsWith(`${CACHE_PREFIX}-static-`) || cacheName.startsWith(`${CACHE_PREFIX}-dynamic-`);
        const isCurrent = cacheName === staticCacheName || cacheName === dynamicCacheName;
        if (isPolytrackCache && !isCurrent) {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
        return Promise.resolve(false);
      });
      await Promise.all(deletions);
      await self.clients.claim();
      console.log('[SW] Service Worker activated with cache version:', cacheVersion);
    } catch (error) {
      console.error('[SW] Activation failed:', error);
    }
  })());
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  const normalizedPath = normalizePath(url.pathname);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (request.mode === 'navigate' || (normalizedPath && normalizedPath.endsWith('.html'))) {
    event.respondWith(networkFirst(request));
  } else if (normalizedPath && precachePaths.has(normalizedPath)) {
    // Static assets from precache - cache first
    event.respondWith(cacheFirst(request));
  } else if (url.origin === location.origin) {
    // Same origin - network first with cache fallback
    event.respondWith(networkFirst(request));
  } else if (EXTERNAL_RESOURCES.some(resource => url.href.startsWith(resource))) {
    // External resources - stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Other requests - network only
    event.respondWith(fetch(request));
  }
});

// Cache strategies
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(staticCacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(dynamicCacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
      return caches.match('/index.html');
    }
    
    return new Response('Content not available offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(dynamicCacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.log('[SW] Network request failed:', error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for analytics
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Placeholder for analytics sync logic
  console.log('[SW] Syncing analytics data...');
}

// Push notifications (future feature)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/logo.svg',
      badge: '/assets/logo.svg',
      data: data.url
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

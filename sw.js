// Service Worker for Polytrack.best
// Version 1.0.0

const CACHE_NAME = 'polytrack-v1.0.0';
const STATIC_CACHE = 'polytrack-static-v1.0.0';
const DYNAMIC_CACHE = 'polytrack-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  'index.html',
  'assets/styles.css',
  'assets/logo.svg',
  'manifest.json',
  'sw.js'
];

// External resources to cache dynamically
const EXTERNAL_RESOURCES = [
  'https://app-polytrack.kodub.com/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(STATIC_CACHE);
      console.log('[SW] Caching static files individually');
      for (const url of STATIC_FILES) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          await cache.put(url, res.clone());
        } catch (e) {
          console.warn('[SW] Failed to cache:', url, e?.message || e);
        }
      }
      console.log('[SW] Static files caching step completed');
      await self.skipWaiting();
    } catch (error) {
      console.error('[SW] Failed during install:', error);
    }
  })());
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (STATIC_FILES.includes(url.pathname)) {
    // Static files - cache first
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
      const cache = await caches.open(STATIC_CACHE);
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
      const cache = await caches.open(DYNAMIC_CACHE);
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
      return caches.match('/index.html');
    }
    
    return new Response('Content not available offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
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
// ══════════════════════════════════════════════
//  حرفي – Service Worker
//  يخلي التطبيق يشتغل أوفلاين وبسرعة 🚀
// ══════════════════════════════════════════════

const CACHE_VERSION = 'harfi-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE    = `${CACHE_VERSION}-api`;

// الملفات اللي هتتحفظ في أول تحميل
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap',
];

// ── Install: حفظ الملفات الثابتة ─────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing حرفي v1...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: مسح الكاش القديم ───────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating حرفي v1...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== API_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: استراتيجية الكاش ──────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls → Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Google Fonts → Cache first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // HTML/JS/CSS → Stale While Revalidate
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Other static → Cache first
  event.respondWith(cacheFirstStrategy(event.request));
});

// ── استراتيجية: Network First ────────────────
async function networkFirstStrategy(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Offline fallback for API
    return new Response(
      JSON.stringify({ success: false, offline: true, message: 'أنت أوفلاين، تحقق من الانترنت' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── استراتيجية: Cache First ──────────────────
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    return new Response('Offline', { status: 503 });
  }
}

// ── استراتيجية: Stale While Revalidate ───────
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => null);

  return cached || fetchPromise || new Response('Offline', { status: 503 });
}

// ── Push Notifications ───────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || {
    title: 'حرفي',
    body: 'عندك تحديث جديد!',
    icon: '/icons/icon-192.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      dir: 'rtl',
      lang: 'ar',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// ── Background Sync ──────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingBookings());
  }
});

async function syncPendingBookings() {
  // في الإنتاج: هتبعت الحجوزات اللي اتعملت أوفلاين
  console.log('[SW] Syncing pending bookings...');
}

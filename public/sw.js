const CACHE_NAME = 'kaoyan-partner-pwa-v2'
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '')
const withBase = (path) => `${BASE_PATH}${path}`
const APP_SHELL = [
  '/',
  '/login',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
].map(withBase)
const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin
const isAssetRequest = (request) => ['script', 'style', 'image', 'font'].includes(request.destination)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(withBase('/'), copy))
          return response
        })
        .catch(() => caches.match(withBase('/')) || caches.match(withBase('/login'))),
    )
    return
  }

  if (!isSameOrigin(request)) return

  if (!isAssetRequest(request)) {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response
        }
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
    }),
  )
})

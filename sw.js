// Supports PWA installation. Offline caching is not implemented.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

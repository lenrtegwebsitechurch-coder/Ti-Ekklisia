/* Service Worker - تي إكليسيا: يجرب النت الأول، ولو مفيش نت يفتح آخر نسخة محفوظة */
const CACHE = "ti-ekklesia-v1";
const FILES = ["./", "index.html", "logo.png", "manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(FILES.map(f => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  /* بنتدخل في ملفات الموقع بس، أما Firebase وجوجل فبيعدّوا عادي */
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});

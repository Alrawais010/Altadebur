const CACHE = "tadabbur-v10";
const FILES = ["./", "index.html", "quran.js", "quran_hafs.js", "UthmanicHafs.ttf", "manifest.json", "icon-180.png", "icon-512.png",
  "AmiriQuran.ttf", "Amiri-Regular.ttf", "Amiri-Bold.ttf",
  "ScheherazadeNew-Regular.ttf", "NotoNaskhArabic.ttf"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // pages: try the network first (so updates and settings apply), fall back to the saved copy offline
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return res;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
  })));
});

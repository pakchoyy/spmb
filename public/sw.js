// Service worker Gerbang. Sengaja sempit: hanya aset statis dan halaman informasi sekolah.
// Dashboard, form, cek status, login, dan semua data pengguna TIDAK PERNAH disimpan.
const VERSI = "v1";
const CACHE_ASET = `aset-${VERSI}`;
const CACHE_HALAMAN = `halaman-${VERSI}`;
const MAKS_UMUR_HALAMAN = 24 * 60 * 60 * 1000; // 1 hari
const DIPESAN = ["admin", "masuk", "daftar", "aktivasi", "super", "api", "auth", "keluar", "syarat", "privasi"];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (![CACHE_ASET, CACHE_HALAMAN].includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const halamanSekolah = (url) => {
  const m = url.pathname.match(/^\/([a-z0-9-]{3,40})\/?$/);
  return m && !DIPESAN.includes(m[1]);
};
const umur = (res) => { const d = Date.parse(res.headers.get("date") || ""); return Number.isNaN(d) ? Infinity : Date.now() - d; };

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Aset berversi (nama file berubah saat update) dan ikon: cache dulu.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/api/ikon/")) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_ASET);
      const ada = await cache.match(req);
      if (ada) return ada;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // Halaman informasi sekolah: tampilkan salinan (maks. 1 hari) sambil memperbarui di latar; offline pun tetap terbuka.
  if (req.mode === "navigate" && halamanSekolah(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_HALAMAN);
      const ada = await cache.match(req);
      const jaringan = fetch(req).then((res) => {
        if (res.ok && res.headers.get("content-type")?.includes("text/html")) cache.put(req, res.clone());
        return res;
      });
      if (ada && umur(ada) < MAKS_UMUR_HALAMAN) { jaringan.catch(() => {}); return ada; }
      try { return await jaringan; } catch (err) { if (ada) return ada; throw err; }
    })());
  }
});

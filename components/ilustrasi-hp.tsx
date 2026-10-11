/**
 * Ilustrasi layar HP (SVG) untuk halaman Cara pakai. Meniru tampilan aplikasi
 * dengan bentuk sederhana; <Ketuk> menandai bagian yang harus diketuk.
 * Koordinat dalam viewBox 180×320; area layar mulai x=12, lebar 156.
 */

const L = 12, W = 156; // kiri dan lebar layar

export function Layar({ judul, warna = "var(--biru)", children, label }:
  { judul: string; warna?: string; children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 180 320" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[220px] drop-shadow-xl">
      <rect width="180" height="320" rx="26" fill="#14204a" />
      <rect x={L} y="12" width={W} height="296" rx="18" fill="#f4f6ff" />
      <path d={`M${L} 30a18 18 0 0 1 18-18h120a18 18 0 0 1 18 18v28H${L}z`} fill={warna} />
      <rect x="72" y="18" width="36" height="5" rx="2.5" fill="#0d1636" opacity=".6" />
      <text x="24" y="48" fill="#fff" fontSize="11" fontWeight="700" fontFamily="var(--font-isi), sans-serif">{judul}</text>
      {children}
    </svg>
  );
}

const teks = { fontFamily: "var(--font-isi), sans-serif" };

/** Kolom isian dengan label kecil di atasnya. */
export const Kolom = ({ y, label, isi }: { y: number; label: string; isi?: string }) => (
  <g>
    <text x="24" y={y} fontSize="7.5" fontWeight="700" fill="#17203d" style={teks}>{label}</text>
    <rect x="24" y={y + 4} width="132" height="18" rx="6" fill="#fff" stroke="#c9cfe3" />
    {isi && <text x="30" y={y + 16} fontSize="7.5" fill="#55607a" style={teks}>{isi}</text>}
  </g>
);

/** Tombol penuh selebar layar. */
export const Tombol = ({ y, teks: t, warna = "var(--biru)", gelap = false }: { y: number; teks: string; warna?: string; gelap?: boolean }) => (
  <g>
    <rect x="24" y={y} width="132" height="20" rx="7" fill={warna} />
    <text x="90" y={y + 13.5} textAnchor="middle" fontSize="8" fontWeight="700" fill={gelap ? "#1b1b1b" : "#fff"} style={teks}>{t}</text>
  </g>
);

/** Kartu putih dengan judul dan baris-baris abu-abu. */
export const Kartu = ({ y, h = 40, judul, baris = 2, warna = "#fff" }: { y: number; h?: number; judul?: string; baris?: number; warna?: string }) => (
  <g>
    <rect x="20" y={y} width="140" height={h} rx="9" fill={warna} stroke="#e3e7f3" />
    {judul && <text x="28" y={y + 13} fontSize="8" fontWeight="700" fill="#17203d" style={teks}>{judul}</text>}
    {Array.from({ length: baris }, (_, i) => (
      <rect key={i} x="28" y={y + (judul ? 19 : 9) + i * 8} width={i % 2 ? 80 : 110} height="4" rx="2" fill="#d6dcf0" />
    ))}
  </g>
);

/** Label kecil berbentuk pil. */
export const Pil = ({ x, y, teks: t, latar, warna }: { x: number; y: number; teks: string; latar: string; warna: string }) => (
  <g>
    <rect x={x} y={y} width={t.length * 4.6 + 12} height="13" rx="6.5" fill={latar} />
    <text x={x + 6} y={y + 9.2} fontSize="7" fontWeight="700" fill={warna} style={teks}>{t}</text>
  </g>
);

/** Penanda "ketuk di sini": lingkaran kuning berdenyut. */
export const Ketuk = ({ x, y }: { x: number; y: number }) => (
  <g aria-hidden>
    <circle cx={x} cy={y} r="11" fill="var(--kuning)" opacity=".35">
      <animate attributeName="r" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values=".5;.15;.5" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <circle cx={x} cy={y} r="5.5" fill="var(--kuning)" stroke="#fff" strokeWidth="1.5" />
  </g>
);

/** Teks bebas dengan gaya aplikasi. */
export const Teks = ({ x = 24, y, t, ukuran = 8, tebal = false, warna = "#17203d", tengah = false }:
  { x?: number; y: number; t: string; ukuran?: number; tebal?: boolean; warna?: string; tengah?: boolean }) => (
  <text x={tengah ? 90 : x} y={y} textAnchor={tengah ? "middle" : "start"} fontSize={ukuran} fontWeight={tebal ? 700 : 400} fill={warna} style={teks}>{t}</text>
);

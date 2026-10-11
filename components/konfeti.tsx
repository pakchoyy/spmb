/** Hujan konfeti ringan (CSS saja) untuk kabar gembira. Mati otomatis bila "kurangi gerakan" aktif. */
const WARNA = ["#2449d8", "#ffc83d", "#18b98a", "#ff7a45", "#7b5cff"];

export default function Konfeti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: 36 }, (_, i) => (
        <span key={i} className="konfeti"
          style={{
            left: `${(i * 37) % 100}%`, background: WARNA[i % WARNA.length],
            animationDelay: `${(i % 9) * 0.15}s`, animationDuration: `${2.4 + (i % 5) * 0.35}s`,
            width: i % 3 ? 8 : 6, height: i % 3 ? 14 : 6, borderRadius: i % 3 ? 2 : 9999,
          }} />
      ))}
    </div>
  );
}

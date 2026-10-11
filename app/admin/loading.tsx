/** Kerangka abu-abu saat halaman admin dimuat, supaya terasa cepat di sinyal lemah. */
export default function Memuat() {
  const kotak = "animate-pulse rounded-3xl bg-neutral-200/70";
  return (
    <main aria-busy className="mx-auto w-full max-w-2xl lg:max-w-3xl lg:pt-8 space-y-4 px-4 pt-4">
      <div className={`${kotak} h-36 !bg-[var(--biru)]/30`} />
      <div className={`${kotak} h-28`} />
      <div className="grid grid-cols-2 gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className={`${kotak} h-20`} />)}</div>
      <div className={`${kotak} h-64`} />
    </main>
  );
}

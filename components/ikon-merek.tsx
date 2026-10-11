/** Logo merek asli (WhatsApp, Instagram) sebagai SVG ringan, menggantikan ikon umum. */
type P = { className?: string; "aria-hidden"?: boolean | "true" | "false" };

export function IkonWa({ className = "size-5", ...p }: P) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden {...p}>
      <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9a12.7 12.7 0 0 0 5.7 1.4h.1c7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.1 1.2-4.2-.3-.4a10.4 10.4 0 0 1-1.6-5.5C5.2 9.8 10 5.1 16 5.1s10.7 4.7 10.7 10.5S21.9 26.1 16 26.1zm5.9-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.7 1.2 3.2 1.3 3.4 2.3 3.5 5.6 4.9c2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.4z" />
    </svg>
  );
}

/** Logo Instagram berwarna gradasi resmi. */
export function IkonIg({ className = "size-5", ...p }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...p}>
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0" stopColor="#fdf497" /><stop offset=".05" stopColor="#fdf497" /><stop offset=".45" stopColor="#fd5949" />
          <stop offset=".6" stopColor="#d6249f" /><stop offset=".9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="16.6" cy="7.4" r="1.1" fill="#fff" />
    </svg>
  );
}

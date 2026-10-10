import "server-only";

// Aktif hanya bila TURNSTILE_SECRET diisi, supaya pengembangan lokal tetap jalan.
export async function lolosTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (!token) return false;
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  return ((await r.json()) as { success?: boolean }).success === true;
}

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
export const SLUG_DIPESAN = ["admin", "masuk", "daftar", "aktivasi", "super", "api", "auth", "keluar", "syarat", "privasi"];

/** "SD Negeri 1 Menteng" -> "sd-negeri-1-menteng" */
export const buatSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");

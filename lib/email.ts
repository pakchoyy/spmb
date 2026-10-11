import "server-only";

/**
 * Kirim email lewat Resend (REST). Tanpa RESEND_API_KEY (pengembangan lokal),
 * isi email dicetak ke log server agar alur tetap bisa dicoba.
 */
export async function kirimEmail(ke: string, subjek: string, teks: string): Promise<boolean> {
  const kunci = process.env.RESEND_API_KEY;
  if (!kunci) {
    console.log(`[email dev] ke=${ke} subjek=${subjek}\n${teks}`);
    return true;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${kunci}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_DARI ?? "SPMB Zone <onboarding@resend.dev>", to: [ke], subject: subjek, text: teks }),
    });
    if (!r.ok) console.error("kirimEmail gagal", r.status);
    return r.ok;
  } catch (e) {
    console.error("kirimEmail error", e);
    return false;
  }
}

import type { Instrumentation } from "next";

// Catat error server ke galat_log (dilihat di /super/galat).
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { catatGalat } = await import("./lib/galat");
  const e = err as Error & { digest?: string };
  await catatGalat("server", `${e.message ?? String(err)}${e.digest ? ` [${e.digest}]` : ""}`, `${request.method} ${request.path}`,
    `${context.routerKind} · ${context.routePath} · ${context.routeType}\n${(e.stack ?? "").slice(0, 3000)}`);
};

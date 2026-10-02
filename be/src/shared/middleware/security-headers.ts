import type { MiddlewareHandler } from "hono";
import { API_CSP, HSTS, PAGE_FALLBACK_CSP, SECURITY_HEADERS } from "../constants/http";

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) c.res.headers.set(k, v);
  if (new URL(c.req.url).protocol === "https:") c.res.headers.set("Strict-Transport-Security", HSTS);
  const isPage = (c.res.headers.get("Content-Type") || "").includes("text/html");
  if (isPage && !c.res.headers.has("Content-Security-Policy")) c.res.headers.set("Content-Security-Policy", PAGE_FALLBACK_CSP);
  if (c.req.path.startsWith("/api/")) {
    c.res.headers.set("Cache-Control", "no-store");
    c.res.headers.set("Content-Security-Policy", API_CSP);
  }
};

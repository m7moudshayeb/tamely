/** Every non-GET call from our page carries this header (CSRF guard). */
export const CSRF_HEADER = "X-Tamely";
export const CSRF_VALUE = "1";

export const NO_STORE = { "Cache-Control": "no-store" } as const;

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/** HTTPS only: browsers then refuse plain-http for a year. */
export const HSTS = "max-age=31536000; includeSubDomains";
/** API replies are data, never a page: nothing may load or frame them. */
export const API_CSP = "default-src 'none'; frame-ancestors 'none'";
/** Biggest JSON body any endpoint needs (a full chat is ~30KB). */
export const MAX_BODY_BYTES = 64 * 1024;

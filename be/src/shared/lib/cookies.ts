import { OAUTH_STATE_COOKIE, OAUTH_STATE_TTL_S, REFRESH_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE_S } from "../constants/security";

const attrs = (secure: boolean, sameSite: "Strict" | "Lax" = "Strict", path = "/") =>
  `Path=${path}; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`;

export const sessionCookie = (value: string, secure: boolean) => `${SESSION_COOKIE}=${value}; ${attrs(secure)}; Max-Age=${SESSION_MAX_AGE_S}`;
export const clearSessionCookie = (secure: boolean) => `${SESSION_COOKIE}=; ${attrs(secure)}; Max-Age=0`;

/** OAuth refresh token lives in its own cookie, only sent to the API. */
export const refreshCookie = (value: string, secure: boolean) => `${REFRESH_COOKIE}=${value}; ${attrs(secure, "Strict", "/api/")}; Max-Age=${SESSION_MAX_AGE_S}`;
export const clearRefreshCookie = (secure: boolean) => `${REFRESH_COOKIE}=; ${attrs(secure, "Strict", "/api/")}; Max-Age=0`;

/** Lax so it survives the top-level redirect back from Cloudflare's consent screen. */
export const oauthStateCookie = (value: string, secure: boolean) => `${OAUTH_STATE_COOKIE}=${value}; ${attrs(secure, "Lax", "/api/v1/auth/")}; Max-Age=${OAUTH_STATE_TTL_S}`;
export const clearOauthStateCookie = (secure: boolean) => `${OAUTH_STATE_COOKIE}=; ${attrs(secure, "Lax", "/api/v1/auth/")}; Max-Age=0`;

export function readCookie(header: string | null | undefined, name = SESSION_COOKIE): string | null {
  const m = (header || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}

export const isSecureUrl = (url: string) => new URL(url).protocol === "https:";

import type { Context, MiddlewareHandler } from "hono";
import { MSG } from "../constants/copy";
import { OAUTH_REFRESH_EARLY_MS, REFRESH_COOKIE, SESSION_IDLE_MS, SESSION_RENEW_AFTER_MS } from "../constants/security";
import { CfClient } from "../lib/cf-client";
import { clearRefreshCookie, clearSessionCookie, isSecureUrl, readCookie, refreshCookie, sessionCookie } from "../lib/cookies";
import { seal, unseal } from "../lib/crypto";
import { AppError } from "../lib/errors";
import type { AppEnv, Session } from "../types/env";
import { refreshTokens } from "../../features/auth/service";

export async function loadSession(cookieHeader: string | undefined, secret: string): Promise<Session | null> {
  const raw = readCookie(cookieHeader);
  if (!raw) return null;
  const s = await unseal<Session>(raw, secret);
  if (!s || typeof s.token !== "string" || typeof s.accountId !== "string" || typeof s.seen !== "number") return null;
  return Date.now() - s.seen < SESSION_IDLE_MS ? s : null;
}

/** Writes the renewed session, keeping the refresh cookie alive alongside it. */
async function renew(c: Context<AppEnv>, next: Session, refreshSealed?: string) {
  const secure = isSecureUrl(c.req.url);
  c.header("Set-Cookie", sessionCookie(await seal(next, c.get("secret")), secure), { append: true });
  if (refreshSealed) c.header("Set-Cookie", refreshCookie(refreshSealed, secure), { append: true });
}

/** Renews active sessions daily; OAuth access is refreshed shortly before it expires. */
export async function freshSession(c: Context<AppEnv>, s: Session): Promise<Session | null> {
  const rawRefresh = readCookie(c.req.header("Cookie"), REFRESH_COOKIE) || undefined;
  const now = Date.now();
  if (s.kind !== "oauth" || !s.exp || s.exp - now > OAUTH_REFRESH_EARLY_MS) {
    if (now - s.seen < SESSION_RENEW_AFTER_MS) return s;
    const next = { ...s, seen: now };
    await renew(c, next, s.kind === "oauth" ? rawRefresh : undefined);
    return next;
  }
  const rt = rawRefresh ? await unseal<string>(rawRefresh, c.get("secret")) : null;
  try {
    if (!rt) throw new Error("no refresh token");
    const t = await refreshTokens(c.env, rt);
    const next: Session = { ...s, token: t.accessToken, exp: t.expiresAt, seen: now };
    await renew(c, next, t.refreshToken ? await seal(t.refreshToken, c.get("secret")) : rawRefresh);
    return next;
  } catch {
    const secure = isSecureUrl(c.req.url);
    c.header("Set-Cookie", clearSessionCookie(secure), { append: true });
    c.header("Set-Cookie", clearRefreshCookie(secure), { append: true });
    return null;
  }
}

/** Rejects with 401 unless a valid sealed session cookie is present. */
export const requireSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const loaded = await loadSession(c.req.header("Cookie"), c.get("secret"));
  const session = loaded ? await freshSession(c, loaded) : null;
  if (!session || !session.accountId) throw new AppError(loaded ? MSG.signInExpired : MSG.notConnected, 401, "not_connected");
  c.set("session", session);
  c.set("cf", new CfClient(session.token, c.env.CF_API_BASE));
  await next();
};

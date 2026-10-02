import { CF_OAUTH_BASE, DEFAULT_OAUTH_SCOPES, OAUTH_AUTHORIZE_PATH, OAUTH_CALLBACK_PATH, OAUTH_TOKEN_PATH } from "../../shared/constants/cloudflare";
import { AppError } from "../../shared/lib/errors";
import type { Env } from "../../shared/types/env";

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

/** Only localhost overrides are honored, so tests can use a mock without risking real traffic. */
export const oauthBase = (env: Env) =>
  env.CF_OAUTH_BASE && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(env.CF_OAUTH_BASE) ? env.CF_OAUTH_BASE : CF_OAUTH_BASE;

export const oauthEnabled = (env: Env) => !!env.OAUTH_CLIENT_ID;

export const redirectUri = (env: Env, requestUrl: string) => env.OAUTH_REDIRECT_URL || new URL(OAUTH_CALLBACK_PATH, requestUrl).toString();

export function authorizeUrl(env: Env, requestUrl: string, state: string, challenge: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.OAUTH_CLIENT_ID!,
    redirect_uri: redirectUri(env, requestUrl),
    scope: (env.OAUTH_SCOPES || DEFAULT_OAUTH_SCOPES.join(" ")).trim(),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${oauthBase(env)}${OAUTH_AUTHORIZE_PATH}?${params.toString()}`;
}

async function tokenRequest(env: Env, fields: Record<string, string>): Promise<OAuthTokens> {
  const body = new URLSearchParams({ client_id: env.OAUTH_CLIENT_ID!, ...fields });
  if (env.OAUTH_CLIENT_SECRET) body.set("client_secret", env.OAUTH_CLIENT_SECRET);
  let res: Response;
  try {
    res = await fetch(`${oauthBase(env)}${OAUTH_TOKEN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new AppError("Couldn't reach Cloudflare to finish signing in. Try again.", 502, "oauth_offline");
  }
  const json = (await res.json().catch(() => null)) as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string } | null;
  if (!res.ok || !json?.access_token) {
    console.error("oauth token error", res.status, json?.error);
    throw new AppError("Cloudflare didn't finish the sign-in. Try again.", 400, json?.error === "invalid_grant" ? "oauth_expired" : "oauth_failed");
  }
  return { accessToken: json.access_token, refreshToken: json.refresh_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
}

export const exchangeCode = (env: Env, requestUrl: string, code: string, verifier: string) =>
  tokenRequest(env, { grant_type: "authorization_code", code, redirect_uri: redirectUri(env, requestUrl), code_verifier: verifier });

export const refreshTokens = (env: Env, refreshToken: string) => tokenRequest(env, { grant_type: "refresh_token", refresh_token: refreshToken });

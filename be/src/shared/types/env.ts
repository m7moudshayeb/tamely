import type { CfClient } from "../lib/cf-client";

/** Cloudflare's rate limiting binding. */
export interface RateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ASSETS: Fetcher;
  SESSION_SECRET: string;
  AI_MODEL?: string;
  AI_FALLBACK_MODEL?: string;
  /** Local testing only; ignored unless it points at localhost. */
  CF_API_BASE?: string;
  /** "Sign in with Cloudflare": shown only when the client id is set. */
  OAUTH_CLIENT_ID?: string;
  OAUTH_CLIENT_SECRET?: string;
  /** Optional overrides: exact callback URL and space-separated scopes. */
  OAUTH_REDIRECT_URL?: string;
  OAUTH_SCOPES?: string;
  /** Local testing only; ignored unless it points at localhost. */
  CF_OAUTH_BASE?: string;
  /** Local testing only: where docs pages are read from. Ignored unless it points at localhost. */
  DOCS_BASE?: string;
  /** Rate limiters (per visitor IP): sign-in, AI, everything else. */
  AUTH_LIMIT?: RateLimiter;
  AI_LIMIT?: RateLimiter;
  API_LIMIT?: RateLimiter;
}

export interface Session {
  token: string;
  accountId: string;
  accountName: string;
  /** "oauth" sessions carry an expiry and are refreshed with a separate cookie. */
  kind?: "token" | "oauth";
  exp?: number;
  /** Last renewal (ms). Checked inside the sealed value, so an old cookie can't outlive it. */
  seen: number;
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    secret: string;
    session: Session;
    cf: CfClient;
  };
};

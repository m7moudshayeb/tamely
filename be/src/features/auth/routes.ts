import { Hono } from "hono";
import { OAUTH_STATE_COOKIE } from "../../shared/constants/security";
import { CfClient } from "../../shared/lib/cf-client";
import { clearOauthStateCookie, isSecureUrl, oauthStateCookie, readCookie, refreshCookie, sessionCookie } from "../../shared/lib/cookies";
import { seal, unseal } from "../../shared/lib/crypto";
import { AppError } from "../../shared/lib/errors";
import type { AppEnv, Session } from "../../shared/types/env";
import { listAccounts } from "../session/service";
import { pkcePair } from "./pkce";
import { authorizeUrl, exchangeCode, oauthEnabled } from "./service";

interface OAuthState {
  state: string;
  verifier: string;
}

/** Errors go back to the app as a short code; the page turns it into plain words. */
const back = (url: string, code: string) => new URL(`/app?auth_error=${encodeURIComponent(code)}`, url).toString();

export const authRoutes = new Hono<AppEnv>()
  .get("/config", (c) => c.json({ cloudflareSignIn: oauthEnabled(c.env) }))
  /** Step 1: send the person to Cloudflare's consent screen. */
  .get("/cloudflare/start", async (c) => {
    if (!oauthEnabled(c.env)) throw new AppError("Sign in with Cloudflare isn't set up on this site yet.", 404, "oauth_off");
    /* Local runs: Cloudflare accepts loopback IPs, not "localhost", so keep the whole trip on 127.0.0.1. */
    const here = new URL(c.req.url);
    if (here.hostname === "localhost") {
      here.hostname = "127.0.0.1";
      return c.redirect(here.toString(), 302);
    }
    const { state, verifier, challenge } = await pkcePair();
    c.header("Set-Cookie", oauthStateCookie(await seal({ state, verifier } satisfies OAuthState, c.get("secret")), isSecureUrl(c.req.url)));
    return c.redirect(authorizeUrl(c.env, c.req.url, state, challenge), 302);
  })
  /** Step 2: Cloudflare sends the person back with a one-time code. */
  .get("/cloudflare/callback", async (c) => {
    const secure = isSecureUrl(c.req.url);
    c.header("Set-Cookie", clearOauthStateCookie(secure), { append: true });
    const err = c.req.query("error");
    if (err) return c.redirect(back(c.req.url, err === "access_denied" ? "denied" : "failed"), 302);
    const saved = await unseal<OAuthState>(readCookie(c.req.header("Cookie"), OAUTH_STATE_COOKIE) || "", c.get("secret"));
    const code = c.req.query("code");
    if (!saved || !code || c.req.query("state") !== saved.state) return c.redirect(back(c.req.url, "expired"), 302);
    try {
      const tokens = await exchangeCode(c.env, c.req.url, code, saved.verifier);
      const accounts = await listAccounts(new CfClient(tokens.accessToken, c.env.CF_API_BASE));
      const session: Session = { token: tokens.accessToken, accountId: accounts[0].id, accountName: accounts[0].name, kind: "oauth", exp: tokens.expiresAt, seen: Date.now() };
      c.header("Set-Cookie", sessionCookie(await seal(session, c.get("secret")), secure), { append: true });
      if (tokens.refreshToken) c.header("Set-Cookie", refreshCookie(await seal(tokens.refreshToken, c.get("secret")), secure), { append: true });
      return c.redirect(new URL("/app?welcome=1", c.req.url).toString(), 302);
    } catch (e) {
      return c.redirect(back(c.req.url, e instanceof AppError && e.code === "no_account" ? "no_account" : "failed"), 302);
    }
  });

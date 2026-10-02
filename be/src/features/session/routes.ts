import { Hono } from "hono";
import type { SessionInfo } from "@tamely/shared/types";
import { MSG } from "../../shared/constants/copy";
import { API_TOKEN } from "../../shared/constants/security";
import { readBody, str } from "../../shared/lib/body";
import { CfClient } from "../../shared/lib/cf-client";
import { clearRefreshCookie, clearSessionCookie, sessionCookie } from "../../shared/lib/cookies";
import { seal } from "../../shared/lib/crypto";
import { AppError } from "../../shared/lib/errors";
import { freshSession, loadSession, requireSession } from "../../shared/middleware/session";
import type { AppEnv, Session } from "../../shared/types/env";
import { listAccounts } from "./service";

const isSecure = (url: string) => new URL(url).protocol === "https:";

export const sessionRoutes = new Hono<AppEnv>()
  /** Connect: validate the token, pick the first account, store everything in a sealed cookie. */
  .post("/", async (c) => {
    const token = str((await readBody<{ token: string }>(c)).token, 300);
    if (!API_TOKEN.test(token)) throw new AppError(MSG.badToken, 400, "bad_token");
    const accounts = await listAccounts(new CfClient(token, c.env.CF_API_BASE));
    const s: Session = { token, accountId: accounts[0].id, accountName: accounts[0].name, kind: "token", seen: Date.now() };
    c.header("Set-Cookie", sessionCookie(await seal(s, c.get("secret")), isSecure(c.req.url)), { append: true });
    c.header("Set-Cookie", clearRefreshCookie(isSecure(c.req.url)), { append: true });
    return c.json<SessionInfo>({ connected: true, account: accounts[0], accounts, method: "token" });
  })
  .get("/", async (c) => {
    const loaded = await loadSession(c.req.header("Cookie"), c.get("secret"));
    if (!loaded) return c.json<SessionInfo>({ connected: false });
    const s = await freshSession(c, loaded);
    if (!s) return c.json<SessionInfo>({ connected: false, error: MSG.signInExpired });
    try {
      const accounts = await listAccounts(new CfClient(s.token, c.env.CF_API_BASE));
      const account = accounts.find((a) => a.id === s.accountId) || accounts[0];
      return c.json<SessionInfo>({ connected: true, account, accounts, method: s.kind === "oauth" ? "oauth" : "token" });
    } catch (e) {
      if (e instanceof AppError && (e.code === "token_rejected" || e.code === "no_account")) {
        c.header("Set-Cookie", clearSessionCookie(isSecure(c.req.url)), { append: true });
        c.header("Set-Cookie", clearRefreshCookie(isSecure(c.req.url)), { append: true });
        return c.json<SessionInfo>({ connected: false, error: MSG.connectionExpired });
      }
      throw e;
    }
  })
  .put("/account", requireSession, async (c) => {
    const id = str((await readBody<{ accountId: string }>(c)).accountId, 64);
    const account = (await listAccounts(c.get("cf"))).find((a) => a.id === id);
    if (!account) throw new AppError("That account isn't available with this token.", 404);
    const s: Session = { ...c.get("session"), accountId: account.id, accountName: account.name };
    c.header("Set-Cookie", sessionCookie(await seal(s, c.get("secret")), isSecure(c.req.url)), { append: true });
    return c.json<SessionInfo>({ connected: true, account, method: c.get("session").kind === "oauth" ? "oauth" : "token" });
  })
  .delete("/", (c) => {
    c.header("Set-Cookie", clearSessionCookie(isSecure(c.req.url)), { append: true });
    c.header("Set-Cookie", clearRefreshCookie(isSecure(c.req.url)), { append: true });
    return c.json<SessionInfo>({ connected: false });
  });

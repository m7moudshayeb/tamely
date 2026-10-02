import { Hono } from "hono";
import { API_PREFIX } from "@tamely/shared/routes";
import { v1 } from "./app/v1";
import { errorHandler } from "./shared/middleware/error-handler";
import { securityHeaders } from "./shared/middleware/security-headers";
import type { AppEnv } from "./shared/types/env";

const app = new Hono<AppEnv>();

app.use("*", securityHeaders);
/* One address for everyone: www.tamely.dev → tamely.dev (keeps sign-in cookies on one host). */
app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (!url.hostname.startsWith("www.")) return next();
  url.hostname = url.hostname.slice(4);
  return c.redirect(url.toString(), 301);
});
app.route(API_PREFIX, v1);
app.all("/api/*", (c) => c.json({ error: "This API version doesn't exist.", code: "bad_version" }, 404));

/** Asset responses have immutable headers; copy them so middleware can add security headers. */
const appShell = async (url: string, assets: Fetcher) => {
  const res = await assets.fetch(new URL("/app/", url));
  return new Response(res.body, { status: 200, headers: new Headers(res.headers) });
};

/** The signed-in app is one page; every /app/* path serves it. */
app.get("/app", (c) => appShell(c.req.url, c.env.ASSETS));
app.get("/app/*", async (c) => {
  if (/\.[a-z0-9]+$/i.test(new URL(c.req.url).pathname)) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    return new Response(res.body, { status: res.status, headers: new Headers(res.headers) });
  }
  return appShell(c.req.url, c.env.ASSETS);
});

/* Everything else is the static site; responses are copied so headers can be added. */
app.all("*", async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: new Headers(res.headers) });
});

app.onError(errorHandler);

export default app;

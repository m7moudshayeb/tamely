import { Hono } from "hono";
import type { AppEnv } from "../../shared/types/env";
import { ensureOwnSite } from "../sites/service";
import { listRedirects } from "./service";

export const redirectsRoutes = new Hono<AppEnv>().get("/", async (c) => {
  const site = await ensureOwnSite(c.get("cf"), c.get("session").accountId, c.req.param("zoneId"));
  return c.json({ redirects: await listRedirects(c.get("cf"), site.id) });
});

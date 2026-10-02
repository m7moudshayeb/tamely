import { Hono } from "hono";
import type { AppEnv } from "../../shared/types/env";
import { ensureOwnSite } from "../sites/service";
import { listDns } from "./service";

export const dnsRoutes = new Hono<AppEnv>().get("/", async (c) => {
  const site = await ensureOwnSite(c.get("cf"), c.get("session").accountId, c.req.param("zoneId"));
  return c.json({ records: await listDns(c.get("cf"), site.id) });
});

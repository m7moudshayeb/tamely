import { Hono } from "hono";
import type { AppEnv } from "../../shared/types/env";
import { listSites } from "./service";

export const sitesRoutes = new Hono<AppEnv>().get("/", async (c) => {
  return c.json({ sites: await listSites(c.get("cf"), c.get("session").accountId) });
});

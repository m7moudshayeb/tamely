import { Hono } from "hono";
import type { AppEnv } from "../../shared/types/env";
import { ensureOwnSite } from "../sites/service";
import { getEmail } from "./service";

export const emailRoutes = new Hono<AppEnv>().get("/", async (c) => {
  const site = await ensureOwnSite(c.get("cf"), c.get("session").accountId, c.req.param("zoneId"));
  return c.json(await getEmail(c.get("cf"), site.id));
});

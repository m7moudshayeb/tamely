import { Hono } from "hono";
import type { AppEnv } from "../../shared/types/env";
import { ensureOwnSite } from "../sites/service";
import { buildBriefing } from "./service";

export const briefingRoutes = new Hono<AppEnv>().get("/", async (c) => {
  const { accountId } = c.get("session");
  const site = await ensureOwnSite(c.get("cf"), accountId, c.req.param("zoneId"));
  return c.json(await buildBriefing(c.get("cf"), site, accountId, c.get("secret")));
});

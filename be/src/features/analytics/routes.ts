import { Hono } from "hono";
import { RANGES, type Range } from "@tamely/shared/types";
import type { AppEnv } from "../../shared/types/env";
import { ensureOwnSite } from "../sites/service";
import { getTraffic } from "./service";

export const analyticsRoutes = new Hono<AppEnv>().get("/", async (c) => {
  const site = await ensureOwnSite(c.get("cf"), c.get("session").accountId, c.req.param("zoneId"));
  const q = c.req.query("range") as Range;
  const range: Range = RANGES.includes(q) ? q : "7d";
  return c.json(await getTraffic(c.get("cf"), site.id, range));
});

import { Hono } from "hono";
import type { AppEnv } from "../../shared/types/env";
import { listSites } from "../sites/service";
import { runChecks } from "./service";

export const setupRoutes = new Hono<AppEnv>().get("/checks", async (c) => {
  const { accountId } = c.get("session");
  const sites = await listSites(c.get("cf"), accountId);
  return c.json({ checks: await runChecks(c.get("cf"), accountId, sites, c.env.AI_MODEL) });
});

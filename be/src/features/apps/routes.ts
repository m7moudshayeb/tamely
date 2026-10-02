import { Hono } from "hono";
import type { AppEnv } from "../../shared/types/env";
import { listApps } from "./service";

export const appsRoutes = new Hono<AppEnv>().get("/", async (c) => {
  return c.json({ apps: await listApps(c.get("cf"), c.get("session").accountId) });
});

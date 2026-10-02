import { Hono } from "hono";
import { findPage } from "@tamely/shared/catalog";
import type { Guide } from "@tamely/shared/types";
import { MSG } from "../../shared/constants/copy";
import { ZONE_ID } from "../../shared/constants/security";
import { aiModels } from "../../shared/lib/ai-models";
import { AppError } from "../../shared/lib/errors";
import type { AppEnv } from "../../shared/types/env";
import { listSites } from "../sites/service";
import { buildGuide } from "./service";

export const guidesRoutes = new Hono<AppEnv>().get("/:pageId", async (c) => {
  const page = findPage(c.req.param("pageId"));
  if (!page) throw new AppError(MSG.notFound, 404, "not_found");
  const { accountId } = c.get("session");
  const cf = c.get("cf");
  /* Dashboard links use the real site name, never one sent by the browser. */
  const zoneId = c.req.query("zoneId");
  const zoneName = page.scope === "zone" && zoneId && ZONE_ID.test(zoneId) ? (await listSites(cf, accountId)).find((s) => s.id === zoneId)?.name : undefined;
  const guide = await buildGuide({ cf, accountId, models: aiModels(c.env), page, zoneName, docsBase: c.env.DOCS_BASE });
  return c.json<Guide>(guide);
});

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { MSG } from "../shared/constants/copy";
import { MAX_BODY_BYTES } from "../shared/constants/http";
import { AppError } from "../shared/lib/errors";
import { csrf } from "../shared/middleware/csrf";
import { rateLimit } from "../shared/middleware/rate-limit";
import { requireSecret } from "../shared/middleware/secret";
import { requireSession } from "../shared/middleware/session";
import type { AppEnv } from "../shared/types/env";
import { actionsRoutes } from "../features/actions/routes";
import { analyticsRoutes } from "../features/analytics/routes";
import { authRoutes } from "../features/auth/routes";
import { appsRoutes } from "../features/apps/routes";
import { assistantRoutes } from "../features/assistant/routes";
import { briefingRoutes } from "../features/briefing/routes";
import { dnsRoutes } from "../features/dns/routes";
import { emailRoutes } from "../features/email/routes";
import { guidesRoutes } from "../features/guides/routes";
import { protectionRoutes } from "../features/protection/routes";
import { redirectsRoutes } from "../features/redirects/routes";
import { sessionRoutes } from "../features/session/routes";
import { setupRoutes } from "../features/setup/routes";
import { sitesRoutes } from "../features/sites/routes";

/** Version 1 of the API. New breaking versions get their own router under /api/v2. */
const protectedApi = new Hono<AppEnv>()
  .use("*", requireSession)
  .route("/sites", sitesRoutes)
  .route("/sites/:zoneId/dns", dnsRoutes)
  .route("/sites/:zoneId/email", emailRoutes)
  .route("/sites/:zoneId/redirects", redirectsRoutes)
  .route("/sites/:zoneId/protection", protectionRoutes)
  .route("/sites/:zoneId/analytics", analyticsRoutes)
  .route("/sites/:zoneId/briefing", briefingRoutes)
  .route("/apps", appsRoutes)
  .route("/actions", actionsRoutes)
  .route("/assistant", assistantRoutes)
  .route("/guides", guidesRoutes)
  .route("/setup", setupRoutes);

/* Order: cheap refusals first (too many, too big, forged), then real work. */
export const v1 = new Hono<AppEnv>()
  .use("*", rateLimit((e) => e.API_LIMIT, "api"))
  .use("/session", rateLimit((e) => e.AUTH_LIMIT, "auth"))
  .use("/auth/cloudflare/*", rateLimit((e) => e.AUTH_LIMIT, "auth"))
  .use("/assistant/*", rateLimit((e) => e.AI_LIMIT, "ai"))
  .use("/guides/*", rateLimit((e) => e.AI_LIMIT, "ai"))
  .use("*", bodyLimit({ maxSize: MAX_BODY_BYTES, onError: () => { throw new AppError(MSG.tooBig, 413, "too_big"); } }))
  .use("*", requireSecret)
  .use("*", csrf)
  .route("/session", sessionRoutes)
  .route("/auth", authRoutes)
  .route("/", protectedApi)
  .all("*", () => {
    throw new AppError(MSG.notFound, 404, "not_found");
  });

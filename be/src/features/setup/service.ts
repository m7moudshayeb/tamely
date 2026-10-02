import type { SetupCheck, Site } from "@tamely/shared/types";
import { DEFAULT_AI_MODEL } from "../../shared/constants/ai";
import { AppError } from "../../shared/lib/errors";
import type { CfClient } from "../../shared/lib/cf-client";
import { getTraffic } from "../analytics/service";
import { listApps } from "../apps/service";
import { complete } from "../assistant/workers-ai";
import { listDns } from "../dns/service";
import { getEmail } from "../email/service";
import { getProtection } from "../protection/service";
import { check } from "./checks";

/** Tries every feature once so onboarding can show what works and how to fix what doesn't. */
export async function runChecks(cf: CfClient, accountId: string, sites: Site[], model = DEFAULT_AI_MODEL): Promise<SetupCheck[]> {
  const site = sites[0];
  const needSite = (fn: (s: Site) => Promise<unknown>) => () => (site ? fn(site) : Promise.resolve());
  return Promise.all([
    check("sites", "Your websites", `Found ${sites.length} website${sites.length === 1 ? "" : "s"}.`, async () => {
      if (!sites.length) throw new AppError("No websites on this account yet. Add one on Cloudflare first.");
    }, ""),
    check("ai", "Free assistant (Cloudflare AI)", "Runs on your account. Free up to 10,000 units a day.", () => complete(cf, accountId, [model], [{ role: "user", content: "Reply with: ok" }], []), "Your token can't run Cloudflare AI. Add Workers AI Read and Edit."),
    check("dns", "Address records", "You can view and change DNS records.", needSite((s) => listDns(cf, s.id)), "Your token can't read DNS. Add DNS Edit."),
    check("protection", "Safety switches", "You can see and flip safety switches.", needSite((s) => getProtection(cf, s.id)), "Your token can't read site settings. Add Zone Settings Edit."),
    check("analytics", "Visitor charts", "Charts and your daily briefing will work.", needSite((s) => getTraffic(cf, s.id, "24h")), "Your token can't read stats. Add Analytics Read."),
    check("email", "Email forwarding", "You can forward addresses to your inbox.", needSite((s) => getEmail(cf, s.id)), "Your token can't read email settings. Add Email Routing Rules Edit."),
    check("apps", "Your apps", "You can see apps deployed on Cloudflare.", () => listApps(cf, accountId), "Your token can't list apps. Add Workers Scripts Read."),
  ]);
}

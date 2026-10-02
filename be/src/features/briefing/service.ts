import type { Briefing, BriefingItem, Site } from "@tamely/shared/types";
import type { CfClient } from "../../shared/lib/cf-client";
import { getTraffic } from "../analytics/service";
import { getProtection } from "../protection/service";
import { securityRule } from "./rules/security";
import { setupRule } from "./rules/setup";
import { trafficRule } from "./rules/traffic";
import type { BriefingRule } from "./types";

const RULES: BriefingRule[] = [setupRule, securityRule, trafficRule];
const ORDER = { attention: 0, good: 1, info: 2 } as const;

function headline(site: Site, items: BriefingItem[]): string {
  const todo = items.filter((i) => i.tone === "attention").length;
  if (site.status !== "active") return `${site.name} is almost ready.`;
  if (!todo) return `${site.name} is protected and running well.`;
  return `${site.name} is running. ${todo === 1 ? "One thing needs" : `${todo} things need`} a look.`;
}

/** Deterministic daily briefing. No AI involved, so it's instant and free. */
export async function buildBriefing(cf: CfClient, site: Site, accountId: string, secret: string): Promise<Briefing> {
  const [protection, traffic] = await Promise.allSettled([getProtection(cf, site.id), getTraffic(cf, site.id, "7d")]);
  const ctx = {
    site,
    accountId,
    secret,
    protection: protection.status === "fulfilled" ? protection.value : null,
    traffic: traffic.status === "fulfilled" ? traffic.value : null,
  };
  const items = (await Promise.all(RULES.map((r) => r(ctx)))).flat();
  items.sort((a, b) => ORDER[a.tone] - ORDER[b.tone]);
  return { site: { id: site.id, name: site.name, status: site.status }, generatedAt: new Date().toISOString(), headline: headline(site, items), items };
}

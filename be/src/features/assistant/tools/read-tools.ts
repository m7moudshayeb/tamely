import { RANGES, type Range } from "@tamely/shared/types";
import { pageSources } from "../../../shared/lib/sources";
import { getTraffic } from "../../analytics/service";
import { listApps } from "../../apps/service";
import { listDns } from "../../dns/service";
import { getEmail } from "../../email/service";
import { getProtection } from "../../protection/service";
import { listRedirects } from "../../redirects/service";
import { needSite } from "./need-site";
import { NO_PARAMS, type ToolDef } from "./types";

export const READ_TOOLS: ToolDef[] = [
  {
    name: "list_websites",
    description: "List the person's websites (domains) on Cloudflare with their status.",
    parameters: NO_PARAMS,
    step: "Looking at your websites",
    run: async (ctx) => ({
      data: ctx.sites.map((s) => ({ name: s.name, status: s.status, plan: s.plan })),
      sources: pageSources("domains", ctx.accountId),
    }),
  },
  {
    name: "get_protection",
    description: "Get the safety switches (always https, under attack, development mode, AI crawler blocking, bot fight mode, email hiding, image theft) and the encryption (SSL) mode of the current website.",
    parameters: NO_PARAMS,
    step: "Checking your safety settings",
    run: async (ctx) => {
      const s = needSite(ctx);
      return { data: await getProtection(ctx.cf, s.id), sources: [...pageSources("sec-settings", ctx.accountId, s.name), ...pageSources("ssl-overview", ctx.accountId, s.name, { app: false })] };
    },
  },
  {
    name: "get_traffic",
    description: "Get visitors, requests, threats blocked, cache share, top countries and change vs the previous period for the current website. Use only when the question is about visitors, traffic or attacks; cite it when you use its numbers.",
    parameters: { type: "object", properties: { range: { type: "string", enum: [...RANGES], description: "24h, 7d or 30d" } } },
    step: "Reading your visitor numbers",
    run: async (ctx, args) => {
      const s = needSite(ctx);
      const range: Range = RANGES.includes(args.range as Range) ? (args.range as Range) : "7d";
      const t = await getTraffic(ctx.cf, s.id, range);
      return {
        data: { range, totals: t.totals, changePercent: t.change, topCountries: t.countries.slice(0, 5), statuses: t.statuses },
        sources: pageSources("http-traffic", ctx.accountId, s.name),
        widget: { type: "traffic", zoneId: s.id, range },
      };
    },
  },
  {
    name: "list_dns_records",
    description: "List the address (DNS) records of the current website, with ids.",
    parameters: NO_PARAMS,
    step: "Checking your address records",
    run: async (ctx) => {
      const s = needSite(ctx);
      return { data: await listDns(ctx.cf, s.id), sources: pageSources("dns-records", ctx.accountId, s.name) };
    },
  },
  {
    name: "list_email_forwards",
    description: "Show whether email forwarding is on for the current website and which addresses forward where.",
    parameters: NO_PARAMS,
    step: "Checking your email forwarding",
    run: async (ctx) => {
      const s = needSite(ctx);
      return { data: await getEmail(ctx.cf, s.id), sources: pageSources("email-routing", ctx.accountId, s.name) };
    },
  },
  {
    name: "list_redirects",
    description: "List page redirects on the current website.",
    parameters: NO_PARAMS,
    step: "Checking your redirects",
    run: async (ctx) => {
      const s = needSite(ctx);
      return { data: await listRedirects(ctx.cf, s.id), sources: pageSources("rules", ctx.accountId, s.name) };
    },
  },
  {
    name: "list_apps",
    description: "List the apps (Workers) deployed on the account.",
    parameters: NO_PARAMS,
    step: "Looking at your apps",
    run: async (ctx) => ({ data: await listApps(ctx.cf, ctx.accountId), sources: pageSources("workers-pages", ctx.accountId) }),
  },
];

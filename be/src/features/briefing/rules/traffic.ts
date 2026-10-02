import { pageSources } from "../../../shared/lib/sources";
import { bytes, compact } from "../format";
import type { BriefingRule } from "../types";

export const trafficRule: BriefingRule = ({ site, accountId, traffic }) => {
  if (!traffic) return [];
  const { totals, change, points } = traffic;
  const sources = pageSources("http-traffic", accountId, site.name);
  const items = [];
  const trend = change.visitors;
  items.push({
    id: "visitors",
    tone: "info" as const,
    icon: "person2",
    title: totals.visitors ? `${compact(totals.visitors)} visitors this week` : "No visitors yet this week",
    detail:
      trend === null
        ? `${compact(totals.requests)} requests in the last 7 days.`
        : `${trend >= 0 ? "Up" : "Down"} ${Math.abs(trend)}% from the week before. ${compact(totals.requests)} requests in total.`,
    metric: { value: compact(totals.visitors), label: "Visitors · 7 days", change: trend },
    series: points.map((p) => p.visitors),
    sources,
    ask: "How is my traffic doing this week?",
  });
  if (totals.threats > 0) {
    items.push({
      id: "threats",
      tone: "good" as const,
      icon: "shieldCheck",
      title: `${compact(totals.threats)} threats blocked`,
      detail: "Cloudflare stopped these before they reached your site. Nothing for you to do.",
      metric: { value: compact(totals.threats), label: "Threats blocked · 7 days", change: change.threats },
      series: points.map((p) => p.threats),
      sources: pageSources("sec-analytics", accountId, site.name, { app: false }),
      ask: "What threats were blocked on my site?",
    });
  }
  if (totals.requests >= 200) {
    const share = Math.round((totals.cached / totals.requests) * 100);
    items.push({
      id: "cache",
      tone: share >= 20 ? ("good" as const) : ("info" as const),
      icon: "bolt",
      title: share >= 20 ? `${share}% served from saved copies` : `Only ${share}% served from saved copies`,
      detail:
        share >= 20
          ? `That saved your server ${bytes(totals.cachedBytes)} of work this week.`
          : "Most visits go all the way to your server. Cache rules can make pages faster.",
      metric: { value: `${share}%`, label: "Served from cache" },
      sources: pageSources("cache-overview", accountId, site.name),
      ask: "How can I make my site faster?",
    });
  }
  return items;
};

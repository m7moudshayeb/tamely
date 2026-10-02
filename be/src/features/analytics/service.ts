import type { Range, Traffic, TrafficPoint } from "@tamely/shared/types";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";
import { DAILY_QUERY, HOURLY_QUERY, type QueryResult, type Row } from "./query";

const HOUR = 3_600_000;
const DAY = 86_400_000;
const PERIOD: Record<Range, { ms: number; hourly: boolean }> = {
  "24h": { ms: DAY, hourly: true },
  "7d": { ms: 7 * DAY, hourly: false },
  "30d": { ms: 30 * DAY, hourly: false },
};

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const isoHour = (d: Date) => new Date(Math.floor(d.getTime() / HOUR) * HOUR).toISOString().replace(".000Z", "Z");

async function fetchRows(cf: CfClient, zoneId: string, range: Range, since: Date, until: Date): Promise<Row[]> {
  const { hourly } = PERIOD[range];
  const vars = hourly
    ? { zone: zoneId, since: isoHour(since), until: isoHour(until) }
    : { zone: zoneId, since: isoDate(since), until: isoDate(new Date(until.getTime() - DAY)) };
  const data = await cf.graphql<QueryResult>(hourly ? HOURLY_QUERY : DAILY_QUERY, vars);
  return data.viewer.zones[0]?.rows || [];
}

const pct = (now: number, before: number): number | null => (before > 0 ? Math.round(((now - before) / before) * 100) : null);

function statusGroup(code: number): Traffic["statuses"][number]["group"] {
  if (code >= 500) return "server_error";
  if (code >= 400) return "client_error";
  if (code >= 300) return "redirect";
  return "ok";
}

function summarize(range: Range, rows: Row[], previous: Row[] | null): Traffic {
  const points: TrafficPoint[] = rows.map((r) => ({
    t: r.dimensions.t,
    requests: r.sum.requests,
    visitors: r.uniq.uniques,
    threats: r.sum.threats,
    cached: r.sum.cachedRequests,
    bytes: r.sum.bytes,
  }));
  const total = (rs: Row[], f: (r: Row) => number) => rs.reduce((a, r) => a + f(r), 0);
  const totals = {
    requests: total(rows, (r) => r.sum.requests),
    visitors: total(rows, (r) => r.uniq.uniques),
    threats: total(rows, (r) => r.sum.threats),
    cached: total(rows, (r) => r.sum.cachedRequests),
    bytes: total(rows, (r) => r.sum.bytes),
    cachedBytes: total(rows, (r) => r.sum.cachedBytes),
    encrypted: total(rows, (r) => r.sum.encryptedRequests),
    pageViews: total(rows, (r) => r.sum.pageViews),
  };
  const countries = new Map<string, { requests: number; threats: number }>();
  const statuses = new Map<Traffic["statuses"][number]["group"], number>();
  for (const r of rows) {
    for (const c of r.sum.countryMap || []) {
      const cur = countries.get(c.clientCountryName) || { requests: 0, threats: 0 };
      countries.set(c.clientCountryName, { requests: cur.requests + c.requests, threats: cur.threats + c.threats });
    }
    for (const s of r.sum.responseStatusMap || []) {
      const g = statusGroup(s.edgeResponseStatus);
      statuses.set(g, (statuses.get(g) || 0) + s.requests);
    }
  }
  const prev = previous
    ? { requests: total(previous, (r) => r.sum.requests), visitors: total(previous, (r) => r.uniq.uniques), threats: total(previous, (r) => r.sum.threats) }
    : null;
  return {
    range,
    points,
    totals,
    change: {
      requests: prev ? pct(totals.requests, prev.requests) : null,
      visitors: prev ? pct(totals.visitors, prev.visitors) : null,
      threats: prev ? pct(totals.threats, prev.threats) : null,
    },
    countries: [...countries.entries()]
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 8),
    statuses: [...statuses.entries()].map(([group, requests]) => ({ group, requests })),
  };
}

/** Traffic for a period plus the change against the period before it. */
export async function getTraffic(cf: CfClient, zoneId: string, range: Range): Promise<Traffic> {
  const { ms } = PERIOD[range];
  const until = new Date(Math.ceil(Date.now() / HOUR) * HOUR);
  const since = new Date(until.getTime() - ms);
  const current = await fetchRows(cf, zoneId, range, since, until);
  let previous: Row[] | null = null;
  try {
    previous = await fetchRows(cf, zoneId, range, new Date(since.getTime() - ms), since);
  } catch (e) {
    if (!(e instanceof AppError)) throw e; // Older data may be outside the plan's history; change stays unknown.
  }
  return summarize(range, current, previous);
}

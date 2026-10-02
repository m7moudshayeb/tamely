export const RANGES = ["24h", "7d", "30d"] as const;
export type Range = (typeof RANGES)[number];

export interface TrafficPoint {
  /** ISO date or datetime */
  t: string;
  requests: number;
  visitors: number;
  threats: number;
  cached: number;
  bytes: number;
}

export interface Traffic {
  range: Range;
  points: TrafficPoint[];
  totals: {
    requests: number;
    visitors: number;
    threats: number;
    cached: number;
    bytes: number;
    cachedBytes: number;
    encrypted: number;
    pageViews: number;
  };
  /** Change vs the previous period of equal length, in percent. null when unknown. */
  change: { requests: number | null; visitors: number | null; threats: number | null };
  /** ISO country codes; the page turns them into names. */
  countries: { code: string; requests: number; threats: number }[];
  statuses: { group: "ok" | "redirect" | "client_error" | "server_error"; requests: number }[];
}

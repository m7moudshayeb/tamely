import { useMemo, useState } from "react";
import { RANGES, type Range } from "@tamely/shared/types";
import { useTraffic } from "@shared/hooks/useTraffic";
import { bytes, compact, countryName, timeLabel } from "@shared/lib/format";
import { AreaTrend, BarList, Card, Donut, EmptyState, SegmentedControl, Skeleton, Stat } from "@ui";
import { NeedSite } from "@features/shell/components/NeedSite";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import styles from "./VisitorsPage.module.css";

type Metric = "visitors" | "requests" | "threats";
const RANGE_LABEL: Record<Range, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" };
const METRIC_LABEL: Record<Metric, string> = { visitors: "Visitors", requests: "Requests", threats: "Threats blocked" };
const STATUS_LABEL = { ok: "Pages that loaded", redirect: "Redirected", client_error: "Not found or blocked", server_error: "Server errors" } as const;

function Charts({ zoneId }: { zoneId: string }) {
  const [range, setRange] = useState<Range>("7d");
  const [metric, setMetric] = useState<Metric>("visitors");
  const q = useTraffic(zoneId, range);
  const hourly = range === "24h";
  const points = useMemo(() => (q.data?.points || []).map((p) => ({ label: timeLabel(p.t, hourly), value: p[metric] })), [q.data, metric, hourly]);

  return (
    <>
      <div className={styles.toolbar}>
        <SegmentedControl label="Time range" value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r, label: RANGE_LABEL[r] }))} />
      </div>
      {q.isLoading && <Skeleton height={380} radius={22} />}
      {q.isError && <EmptyState icon="chart" title="Visitor numbers aren't available">{(q.error as Error).message}</EmptyState>}
      {q.data && (
        <>
          <Card padding="lg" className={styles.stats}>
            <Stat label="Visitors" value={compact(q.data.totals.visitors)} change={q.data.change.visitors} />
            <Stat label="Requests" value={compact(q.data.totals.requests)} change={q.data.change.requests} />
            <Stat label="Threats blocked" value={compact(q.data.totals.threats)} hint="Stopped by Cloudflare" />
            <Stat label="Data served" value={bytes(q.data.totals.bytes)} hint={`${bytes(q.data.totals.cachedBytes)} from cache`} />
          </Card>
          <Card padding="lg" className={styles.trend}>
            <div className={styles.cardHead}>
              <h2>{METRIC_LABEL[metric]}</h2>
              <SegmentedControl label="What to show" value={metric} onChange={setMetric} options={(Object.keys(METRIC_LABEL) as Metric[]).map((m) => ({ value: m, label: METRIC_LABEL[m].split(" ")[0] }))} />
            </div>
            <AreaTrend points={points} name={METRIC_LABEL[metric]} height={200} formatValue={compact} seriesIndex={metric === "threats" ? 2 : 0} />
            <table className="sr-only">
              <caption>{METRIC_LABEL[metric]} by {hourly ? "hour" : "day"}</caption>
              <tbody>{points.map((p) => <tr key={p.label}><th>{p.label}</th><td>{p.value}</td></tr>)}</tbody>
            </table>
          </Card>
          <div className={styles.split}>
            <Card padding="lg" className={styles.block}>
              <h2>Where visitors come from</h2>
              {q.data.countries.length ? (
                <BarList label="Requests by country" items={q.data.countries.map((c) => ({ key: c.code, label: countryName(c.code), value: c.requests, display: compact(c.requests) }))} />
              ) : (
                <p className={styles.muted}>No visits yet.</p>
              )}
            </Card>
            <Card padding="lg" className={styles.block}>
              <h2>Served from saved copies</h2>
              <Donut
                label="Share of requests served from cache"
                center={`${q.data.totals.requests ? Math.round((q.data.totals.cached / q.data.totals.requests) * 100) : 0}%`}
                centerLabel="from cache"
                slices={[
                  { label: "From saved copies", value: q.data.totals.cached },
                  { label: "From your server", value: Math.max(0, q.data.totals.requests - q.data.totals.cached) },
                ]}
              />
              <h2 className={styles.sub}>How pages answered</h2>
              <BarList
                label="Responses by result"
                items={[...q.data.statuses].sort((a, b) => b.requests - a.requests).map((s) => ({ key: s.group, label: STATUS_LABEL[s.group], value: s.requests, display: compact(s.requests) }))}
              />
            </Card>
          </div>
        </>
      )}
    </>
  );
}

export default function VisitorsPage() {
  return (
    <Page wide>
      <PageHeader icon="chart" color="blue" title="Visitors" subtitle="Who visited, from where, and what Cloudflare blocked." sourceId="http-traffic" />
      <NeedSite>{(site) => <Charts zoneId={site.id} />}</NeedSite>
    </Page>
  );
}

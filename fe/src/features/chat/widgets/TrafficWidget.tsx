import type { Range } from "@tamely/shared/types";
import { useMemo } from "react";
import { Link } from "wouter";
import { APP_ROUTES } from "@tamely/shared/routes";
import { useTraffic } from "@shared/hooks/useTraffic";
import { compact, timeLabel } from "@shared/lib/format";
import { AreaTrend, Icon, Skeleton, Stat } from "@ui";
import styles from "./TrafficWidget.module.css";

/** Inline chart the assistant attaches when it looked at traffic. */
export function TrafficWidget({ zoneId, range }: { zoneId: string; range: Range }) {
  const q = useTraffic(zoneId, range);
  const points = useMemo(() => (q.data?.points || []).map((p) => ({ label: timeLabel(p.t, range === "24h"), value: p.visitors })), [q.data, range]);
  if (q.isLoading) return <Skeleton height={220} radius={18} />;
  if (!q.data) return null;
  const t = q.data.totals;
  return (
    <div className={styles.widget}>
      <div className={styles.stats}>
        <Stat size="sm" label="Visitors" value={compact(t.visitors)} change={q.data.change.visitors} />
        <Stat size="sm" label="Requests" value={compact(t.requests)} change={q.data.change.requests} />
        <Stat size="sm" label="Threats blocked" value={compact(t.threats)} />
      </div>
      <AreaTrend points={points} name="Visitors" height={160} formatValue={compact} />
      <Link href={APP_ROUTES.visitors} className={styles.more}>All visitor numbers <Icon name="chevronRight" size={13} weight={2.4} /></Link>
    </div>
  );
}

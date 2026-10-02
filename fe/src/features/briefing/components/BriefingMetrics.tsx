import type { BriefingItem } from "@tamely/shared/types";
import { Icon, Sparkline } from "@ui";
import styles from "./Briefing.module.css";

/** The numbers at a glance: value, label, trend line, change. */
export function BriefingMetrics({ items }: { items: BriefingItem[] }) {
  if (!items.length) return null;
  const order = ["visitors", "threats", "cache"];
  const sorted = [...items].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return (
    <div className={styles.metrics}>
      {sorted.map((it, i) => (
        <div key={it.id} className={styles.metric} title={it.detail}>
          <span className={styles.metricLabel}>{it.metric!.label}</span>
          <span className={styles.metricValue}>{it.metric!.value}</span>
          <div className={styles.metricFoot}>
            {typeof it.metric!.change === "number" && it.metric!.change !== 0 && (
              <span className={it.metric!.change >= 0 === (it.id !== "threats") ? styles.up : styles.down}>
                <Icon name="arrowUp" size={11} weight={2.6} style={{ transform: it.metric!.change >= 0 ? undefined : "rotate(180deg)" }} />
                {Math.abs(it.metric!.change)}%
              </span>
            )}
            {it.series && it.series.length > 1 && <Sparkline values={it.series} width={64} height={22} series={((i % 3) + 1) as 1 | 2 | 3} />}
          </div>
        </div>
      ))}
    </div>
  );
}

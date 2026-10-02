import { useMemo } from "react";
import { EChart } from "./EChart";
import { chartTokens, tooltipBase } from "./theme";
import styles from "./Donut.module.css";

export interface DonutSlice {
  label: string;
  value: number;
}

/** Up to 3 slices (validated palette), always with a visible legend and values. */
export function Donut({ slices, center, centerLabel, height = 140, label }: { slices: DonutSlice[]; center: string; centerLabel: string; height?: number; label: string }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const option = useMemo(() => {
    const t = chartTokens();
    return {
      tooltip: { ...tooltipBase(), trigger: "item", valueFormatter: (v: number) => `${Math.round((v / total) * 100)}%` },
      series: [
        {
          type: "pie",
          radius: ["68%", "92%"],
          padAngle: 2,
          itemStyle: { borderRadius: 4, borderColor: t.surface, borderWidth: 2 },
          label: { show: false },
          data: slices.slice(0, 3).map((s, i) => ({ name: s.label, value: s.value, itemStyle: { color: t.series[i] } })),
        },
      ],
    };
  }, [slices, total]);
  return (
    <div className={styles.donut}>
      <div className={styles.chart} style={{ width: height, height }}>
        <EChart option={option} height={height} label={label} />
        <div className={styles.center}>
          <strong>{center}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className={styles.legend}>
        {slices.slice(0, 3).map((s, i) => (
          <li key={s.label}>
            <i style={{ background: `var(--c-series-${i + 1})` }} />
            <span>{s.label}</span>
            <b>{Math.round((s.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

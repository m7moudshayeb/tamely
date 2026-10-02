import { useEffect, useRef, useState } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { Skeleton } from "../components/Skeleton";
import styles from "./EChart.module.css";

type Core = typeof import("./echarts-core")["echarts"];
let corePromise: Promise<Core> | null = null;
const loadCore = () => (corePromise ??= import("./echarts-core").then((m) => m.echarts));

export interface EChartProps {
  option: EChartsCoreOption;
  height?: number;
  label: string;
}

/** Lazy-loads ECharts (SVG renderer) and keeps the chart sized to its box. */
export function EChart({ option, height = 220, label }: EChartProps) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<ReturnType<Core["init"]> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;
    loadCore().then((ec) => {
      if (disposed || !el.current) return;
      chart.current = ec.init(el.current, undefined, { renderer: "svg" });
      ro = new ResizeObserver(() => chart.current?.resize());
      ro.observe(el.current);
      setReady(true);
    });
    return () => {
      disposed = true;
      ro?.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    if (ready) chart.current?.setOption(option, true);
  }, [ready, option]);

  return (
    <div className={styles.wrap} style={{ height }} role="img" aria-label={label}>
      {!ready && <div className={styles.skeleton}><Skeleton height="100%" radius={12} /></div>}
      <div ref={el} className={styles.chart} aria-hidden />
    </div>
  );
}

import { useMemo } from "react";
import { EChart } from "./EChart";
import { chartTokens, tooltipBase } from "./theme";

export interface AreaTrendProps {
  points: { label: string; value: number }[];
  name: string;
  height?: number;
  formatValue?: (n: number) => string;
  seriesIndex?: 0 | 1 | 2;
}

/** One series over time: 2px line, soft fill, crosshair tooltip. */
export function AreaTrend({ points, name, height = 240, formatValue = (n) => n.toLocaleString(), seriesIndex = 0 }: AreaTrendProps) {
  const option = useMemo(() => {
    const t = chartTokens();
    const color = t.series[seriesIndex];
    return {
      animationDuration: 600,
      grid: { left: 8, right: 12, top: 16, bottom: 4, containLabel: true },
      tooltip: {
        ...tooltipBase(),
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: t.ink3, width: 1, type: "dashed" } },
        valueFormatter: (v: number) => formatValue(v),
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: points.map((p) => p.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: t.ink3, fontFamily: t.font, fontSize: 11, hideOverlap: true, margin: 12 },
      },
      yAxis: {
        type: "value",
        splitNumber: 3,
        axisLabel: { color: t.ink3, fontFamily: t.font, fontSize: 11, formatter: (v: number) => formatValue(v) },
        splitLine: { lineStyle: { color: t.grid } },
      },
      series: [
        {
          name,
          type: "line",
          smooth: 0.35,
          symbol: "circle",
          symbolSize: 8,
          showSymbol: false,
          lineStyle: { width: 2, color },
          itemStyle: { color, borderColor: t.surface, borderWidth: 2 },
          areaStyle: {
            color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + "38" }, { offset: 1, color: color + "00" }] },
          },
          data: points.map((p) => p.value),
        },
      ],
    };
  }, [points, name, formatValue, seriesIndex]);
  return <EChart option={option} height={height} label={`${name} over time`} />;
}

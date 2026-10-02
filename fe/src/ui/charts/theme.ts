/** Chart colors are read from the design tokens at runtime; nothing is hard-coded here. */
export function token(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const chartTokens = () => ({
  series: [token("--c-series-1"), token("--c-series-2"), token("--c-series-3")],
  muted: token("--c-series-muted"),
  grid: token("--c-chart-grid"),
  ink: token("--c-ink"),
  ink2: token("--c-ink-2"),
  ink3: token("--c-ink-3"),
  surface: token("--c-surface-raised"),
  font: token("--font-sans"),
});

export const tooltipBase = () => {
  const t = chartTokens();
  return {
    backgroundColor: t.surface,
    borderWidth: 0,
    padding: [8, 12],
    extraCssText: "border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.12);",
    textStyle: { color: t.ink, fontFamily: t.font, fontSize: 12 },
  };
};

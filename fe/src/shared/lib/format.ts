export const compact = (n: number): string =>
  new Intl.NumberFormat("en", { notation: Math.abs(n) >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n || 0);

export function bytes(n: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n || 0;
  while (v >= 1024 && i < units.length - 1) (v /= 1024), i++;
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

const regions = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
export const countryName = (code: string): string => {
  try {
    return (code && regions?.of(code.toUpperCase())) || code || "Unknown";
  } catch {
    return code || "Unknown";
  }
};

export function timeLabel(t: string, hourly: boolean): string {
  const d = new Date(hourly ? t : `${t}T00:00:00Z`);
  return hourly
    ? d.toLocaleTimeString("en", { hour: "numeric" })
    : d.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function relative(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const r = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (s < 3600) return r.format(-Math.max(1, Math.round(s / 60)), "minute");
  if (s < 86400) return r.format(-Math.round(s / 3600), "hour");
  return r.format(-Math.round(s / 86400), "day");
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  return h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

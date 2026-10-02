import type { Range } from "@tamely/shared/types";

export const QK = {
  session: ["session"] as const,
  sites: ["sites"] as const,
  site: (zoneId: string) => ["site", zoneId] as const,
  dns: (zoneId: string) => ["site", zoneId, "dns"] as const,
  email: (zoneId: string) => ["site", zoneId, "email"] as const,
  redirects: (zoneId: string) => ["site", zoneId, "redirects"] as const,
  protection: (zoneId: string) => ["site", zoneId, "protection"] as const,
  analytics: (zoneId: string, range: Range) => ["site", zoneId, "analytics", range] as const,
  briefing: (zoneId: string) => ["site", zoneId, "briefing"] as const,
  apps: ["apps"] as const,
  checks: ["setup", "checks"] as const,
  authConfig: ["auth", "config"] as const,
  guide: (pageId: string, zoneId: string | null) => ["guide", pageId, zoneId] as const,
};

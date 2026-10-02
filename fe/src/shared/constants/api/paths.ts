import { API_PREFIX } from "@tamely/shared/routes";

/** Every API path the page calls. Versioned under /api/v1. */
export const API = {
  base: API_PREFIX,
  session: "/session",
  sessionAccount: "/session/account",
  sites: "/sites",
  site: (zoneId: string, part: "dns" | "email" | "redirects" | "protection" | "analytics" | "briefing") => `/sites/${zoneId}/${part}`,
  apps: "/apps",
  actions: "/actions",
  confirm: "/actions/confirm",
  chat: "/assistant/chat",
  checks: "/setup/checks",
  guide: (pageId: string) => `/guides/${encodeURIComponent(pageId)}`,
  authConfig: "/auth/config",
  /** Full-page navigation, not an XHR: Cloudflare shows its consent screen. */
  cloudflareSignIn: `${API_PREFIX}/auth/cloudflare/start`,
} as const;

export const CSRF_HEADER = { "X-Tamely": "1" } as const;

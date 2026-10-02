/** In-app screens. Shared so the API can cite and link to them. */
export const APP_ROUTES = {
  home: "/app",
  visitors: "/app/visitors",
  address: "/app/address",
  protection: "/app/protection",
  speed: "/app/speed",
  email: "/app/email",
  redirects: "/app/redirects",
  apps: "/app/apps",
  explore: "/app/explore",
  setup: "/app/setup",
  guide: "/app/guide",
} as const;

/** In-app guide for one Cloudflare page. */
export const guidePath = (pageId: string) => `${APP_ROUTES.guide}/${encodeURIComponent(pageId)}`;

export type AppRouteKey = keyof typeof APP_ROUTES;

export const API_PREFIX = "/api/v1";

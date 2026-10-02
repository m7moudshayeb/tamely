/** Cloudflare OAuth endpoints (from dash.cloudflare.com/.well-known/openid-configuration). */
export const CF_OAUTH_BASE = "https://dash.cloudflare.com";
export const OAUTH_AUTHORIZE_PATH = "/oauth2/auth";
export const OAUTH_TOKEN_PATH = "/oauth2/token";
export const OAUTH_REVOKE_PATH = "/oauth2/revoke";
export const OAUTH_CALLBACK_PATH = "/api/v1/auth/cloudflare/callback";

/** Same 13 permissions as the token template, as OAuth scope ids (from the dashboard's scope list). */
export const DEFAULT_OAUTH_SCOPES = [
  "offline_access",
  "account-settings.read",
  "workers-scripts.read",
  "ai.read",
  "ai.write",
  "email-routing-address.write",
  "zone.read",
  "dns.write",
  "zone-settings.write",
  "cache.purge",
  "analytics.read",
  "bot-management.write",
  "email-routing-rule.write",
  "dynamic-redirect.write",
];

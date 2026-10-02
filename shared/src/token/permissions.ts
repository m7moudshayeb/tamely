/** Permissions Tamely asks for. Keys verified against Cloudflare's token template URL. */
export interface TokenPermission {
  key: string;
  type: "read" | "edit" | "purge";
  scope: "Account" | "Zone";
  cfName: string;
  why: string;
}

export const TOKEN_PERMISSIONS: TokenPermission[] = [
  { key: "account_settings", type: "read", scope: "Account", cfName: "Account Settings", why: "Find your account" },
  { key: "workers_scripts", type: "read", scope: "Account", cfName: "Workers Scripts", why: "List your apps" },
  { key: "ai", type: "read", scope: "Account", cfName: "Workers AI", why: "Run the free assistant on your account" },
  { key: "ai", type: "edit", scope: "Account", cfName: "Workers AI", why: "Run the free assistant on your account" },
  { key: "email_routing_address", type: "edit", scope: "Account", cfName: "Email Routing Addresses", why: "Add the inbox you forward to" },
  { key: "zone", type: "read", scope: "Zone", cfName: "Zone", why: "List your websites" },
  { key: "dns", type: "edit", scope: "Zone", cfName: "DNS", why: "Connect your domain" },
  { key: "zone_settings", type: "edit", scope: "Zone", cfName: "Zone Settings", why: "Safety and speed switches" },
  { key: "cache", type: "purge", scope: "Zone", cfName: "Cache Purge", why: "Clear saved copies" },
  { key: "analytics", type: "read", scope: "Zone", cfName: "Analytics", why: "Visitor charts and your briefing" },
  { key: "bot_management", type: "edit", scope: "Zone", cfName: "Bot Management", why: "Block bad and AI bots" },
  { key: "email_routing_rule", type: "edit", scope: "Zone", cfName: "Email Routing Rules", why: "Email forwarding" },
  { key: "dynamic_redirect", type: "edit", scope: "Zone", cfName: "Single Redirect", why: "Redirect links" },
];

export const TOKEN_NAME = "Tamely";

/** Opens Cloudflare's "Create token" form with every permission already filled in. */
export function buildTokenUrl(): string {
  const keys = TOKEN_PERMISSIONS.map(({ key, type }) => ({ key, type }));
  const params = new URLSearchParams({
    permissionGroupKeys: JSON.stringify(keys),
    accountId: "*",
    zoneId: "all",
    name: TOKEN_NAME,
  });
  return `https://dash.cloudflare.com/profile/api-tokens?${params.toString()}`;
}

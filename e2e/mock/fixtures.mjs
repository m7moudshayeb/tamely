// Sample account used by the mock Cloudflare API.
export const ACCT = "c".repeat(32);
export const ZONE = "a".repeat(32);
export const ZONE2 = "b".repeat(32);
export const RULESET = "e".repeat(32);

export const zones = [
  { id: ZONE, name: "babara.app", status: "active", plan: { name: "Free" }, name_servers: ["ada.ns.cloudflare.com", "bob.ns.cloudflare.com"] },
  { id: ZONE2, name: "untick.dev", status: "pending", plan: { name: "Free" }, name_servers: ["cruz.ns.cloudflare.com", "dina.ns.cloudflare.com"] },
];

export function initialState() {
  return {
    settings: { always_use_https: "off", security_level: "medium", development_mode: "on", email_obfuscation: "on", hotlink_protection: "off", ssl: "full" },
    bots: { ai_bots_protection: "disabled", fight_mode: false },
    dns: [
      { id: "1".repeat(32), type: "A", name: "babara.app", content: "192.0.2.1", proxied: true, proxiable: true },
      { id: "2".repeat(32), type: "CNAME", name: "app.babara.app", content: "babara.pages.dev", proxied: true, proxiable: true },
      { id: "3".repeat(32), type: "MX", name: "babara.app", content: "route1.mx.cloudflare.net", priority: 13, proxied: false, proxiable: false },
      { id: "4".repeat(32), type: "TXT", name: "babara.app", content: "v=spf1 include:_spf.mx.cloudflare.net ~all", proxied: false, proxiable: false },
    ],
    emailEnabled: true,
    emailRules: [{ id: "r".repeat(20), enabled: true, matchers: [{ type: "literal", field: "to", value: "hello@babara.app" }], actions: [{ type: "forward", value: ["owner@gmail.com"] }] }],
    addresses: [{ email: "owner@gmail.com", verified: "2026-01-01T00:00:00Z" }],
    redirects: null,
    purges: 0,
  };
}

/** Deterministic traffic so screenshots are repeatable. */
export function trafficRows(hourly, count, offset) {
  const rows = [];
  const base = hourly ? Date.UTC(2026, 9, 1, 0) : Date.UTC(2026, 8, 25);
  for (let i = 0; i < count; i++) {
    const wave = Math.round(900 + 500 * Math.sin((i + offset) / 2.2) + i * 35);
    const t = hourly ? new Date(base + i * 3600e3).toISOString() : new Date(base + i * 86400e3).toISOString().slice(0, 10);
    rows.push({
      dimensions: { t },
      sum: {
        requests: wave * 4,
        cachedRequests: Math.round(wave * 4 * 0.42),
        threats: 20 + ((i * 7) % 13),
        bytes: wave * 4 * 52000,
        cachedBytes: wave * 4 * 21000,
        encryptedRequests: Math.round(wave * 4 * 0.93),
        pageViews: wave * 2,
        countryMap: [
          { clientCountryName: "US", requests: wave * 2, threats: 9 },
          { clientCountryName: "DE", requests: Math.round(wave * 0.8), threats: 4 },
          { clientCountryName: "PS", requests: Math.round(wave * 0.6), threats: 1 },
          { clientCountryName: "GB", requests: Math.round(wave * 0.4), threats: 2 },
          { clientCountryName: "FR", requests: Math.round(wave * 0.2), threats: 1 },
        ],
        responseStatusMap: [
          { edgeResponseStatus: 200, requests: Math.round(wave * 3.4) },
          { edgeResponseStatus: 301, requests: Math.round(wave * 0.3) },
          { edgeResponseStatus: 404, requests: Math.round(wave * 0.25) },
          { edgeResponseStatus: 502, requests: Math.round(wave * 0.05) },
        ],
      },
      uniq: { uniques: Math.round(wave * 0.6) },
    });
  }
  return rows;
}

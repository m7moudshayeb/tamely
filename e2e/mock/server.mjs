// Mock Cloudflare API (REST + GraphQL + Workers AI) for end-to-end tests.
import http from "node:http";
import { aiRespond } from "./ai.mjs";
import { ACCT, RULESET, ZONE, ZONE2, initialState, trafficRows, zones } from "./fixtures.mjs";

const PORT = Number(process.env.MOCK_PORT || 8790);
const P = "/client/v4";
let state = initialState();
let calls = [];
let oauthMode = "ok";
let docsMode = "ok";
let refreshes = 0;

const ok = (result) => [200, { success: true, errors: [], result }];
const fail = (status, code, message) => [status, { success: false, errors: [{ code, message }], result: null }];
const id32 = () => [...Array(32)].map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

function route(method, path, body, auth) {
  if (path === "/__calls") return [200, calls];
  if (path === "/__reset") { state = initialState(); calls = []; oauthMode = "ok"; refreshes = 0; docsMode = "ok"; return [200, { ok: true }]; }
  if (path.startsWith("/__oauth")) { oauthMode = new URL(path, "http://x").searchParams.get("mode") || "ok"; return [200, { oauthMode, refreshes }]; }
  if (path.startsWith("/oauth2/auth")) {
    // Pretend the person approved (or declined) on Cloudflare's consent screen.
    const q = new URL(path, "http://x").searchParams;
    const back = new URL(q.get("redirect_uri"));
    if (oauthMode === "deny") back.searchParams.set("error", "access_denied");
    else { back.searchParams.set("code", "MOCK_CODE"); back.searchParams.set("state", q.get("state")); }
    return [302, { location: back.toString(), scope: q.get("scope"), challenge: q.get("code_challenge") }];
  }
  if (path === "/oauth2/token") {
    const f = new URLSearchParams(body || "");
    if (f.get("grant_type") === "authorization_code" && f.get("code") === "MOCK_CODE" && f.get("code_verifier")) {
      return [200, { access_token: "GOOD_TOKEN_abcdefghijklmnopqrstuvwxyz", refresh_token: "MOCK_REFRESH_1", expires_in: oauthMode === "short" ? 30 : 3600, token_type: "bearer" }];
    }
    if (f.get("grant_type") === "refresh_token" && f.get("refresh_token")?.startsWith("MOCK_REFRESH")) {
      refreshes++;
      return [200, { access_token: "GOOD_TOKEN_abcdefghijklmnopqrstuvwxyz", refresh_token: `MOCK_REFRESH_${refreshes + 1}`, expires_in: 3600 }];
    }
    return [400, { error: "invalid_grant" }];
  }
  if (!path.startsWith(P)) return fail(404, 7000, "no route");
  const p = path.slice(P.length);
  if (auth !== "Bearer GOOD_TOKEN_abcdefghijklmnopqrstuvwxyz") return fail(400, 1000, "Invalid API Token");

  if (p.startsWith(`/accounts/${ACCT}/ai/v1/chat/completions`)) return aiRespond(body);
  if (p.startsWith("/accounts?")) return ok([{ id: ACCT, name: "Shayeb's account" }]);
  if (p === `/accounts/${ACCT}/oauth_clients` && method === "POST") return ok({ client_id: "mock-client-id", client_secret: "MOCK_CLIENT_SECRET_value", ...body });
  if (p.startsWith("/zones?")) return ok(zones);
  if (p === "/graphql") {
    const hourly = body.query.includes("httpRequests1hGroups");
    const zone = body.variables.zone;
    const DAY = 86400e3;
    const since = Date.parse(body.variables.since), until = Date.parse(body.variables.until);
    const span = hourly ? until - since : until - since + DAY;
    const isPrev = until < Date.now() - span / 2;
    const count = hourly ? 24 : Math.round(span / DAY);
    const rows = zone === ZONE ? trafficRows(hourly, count, isPrev ? 3 : 0).map((r) => (isPrev ? { ...r, uniq: { uniques: Math.round(r.uniq.uniques * 0.8) } } : r)) : [];
    return [200, { data: { viewer: { zones: [{ rows }] } }, errors: null }];
  }
  const z = p.match(/^\/zones\/([a-f0-9]{32})(\/.*)?$/);
  if (z) {
    const [, zid, rest = ""] = z;
    if (zid !== ZONE && zid !== ZONE2) return fail(404, 1001, "zone not found");
    if (rest === "/settings") return ok(Object.entries(state.settings).map(([id, value]) => ({ id, value })));
    const setting = rest.match(/^\/settings\/([a-z_]+)$/);
    if (setting && method === "PATCH") { state.settings[setting[1]] = body.value; return ok({ id: setting[1], value: body.value }); }
    if (rest === "/bot_management") { if (method === "PUT") Object.assign(state.bots, body); return ok(state.bots); }
    if (rest === "/purge_cache") { state.purges++; return ok({ id: zid }); }
    if (rest.startsWith("/dns_records")) {
      if (method === "GET") return ok(state.dns);
      if (method === "POST") { const r = { id: id32(), proxiable: true, ...body, name: body.name === "@" ? "babara.app" : `${body.name}.babara.app` }; state.dns.push(r); return ok(r); }
      if (method === "DELETE") { const rid = rest.split("/")[2]; state.dns = state.dns.filter((r) => r.id !== rid); return ok({ id: rid }); }
    }
    if (rest === "/email/routing") return ok({ enabled: state.emailEnabled });
    if (rest === "/email/routing/dns") { state.emailEnabled = true; return ok({ enabled: true }); }
    if (rest.startsWith("/email/routing/rules")) {
      if (method === "GET") return ok(state.emailRules);
      if (method === "POST") { state.emailRules.push({ id: id32(), ...body }); return ok({}); }
      if (method === "DELETE") { const rid = rest.split("/")[4]; state.emailRules = state.emailRules.filter((r) => r.id !== rid); return ok({}); }
    }
    if (rest === "/rulesets/phases/http_request_dynamic_redirect/entrypoint") {
      if (method === "PUT") { state.redirects = { id: RULESET, rules: body.rules.map((r) => ({ ...r, id: id32() })) }; return ok(state.redirects); }
      return state.redirects ? ok(state.redirects) : fail(404, 10003, "not found");
    }
    if (rest === `/rulesets/${RULESET}/rules` && method === "POST") { state.redirects.rules.push({ ...body, id: id32() }); return ok(state.redirects); }
    const del = rest.match(new RegExp(`^/rulesets/${RULESET}/rules/([a-f0-9]{32})$`));
    if (del && method === "DELETE") { state.redirects.rules = state.redirects.rules.filter((r) => r.id !== del[1]); return ok(state.redirects); }
  }
  if (p.startsWith(`/accounts/${ACCT}/email/routing/addresses`)) {
    if (method === "GET") return ok(state.addresses);
    state.addresses.push({ email: body.email, verified: null });
    return ok({});
  }
  if (p.startsWith(`/accounts/${ACCT}/workers/scripts`)) return ok([{ id: "untick", modified_on: "2026-09-30T10:00:00Z" }, { id: "babara", modified_on: "2026-09-28T08:00:00Z" }]);
  return fail(404, 7003, `no route ${method} ${p}`);
}

http
  .createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", async () => {
      let body;
      try { body = raw ? JSON.parse(raw) : undefined; } catch { body = raw; }
      const url = new URL(req.url, "http://x");
      if (!url.pathname.startsWith("/__")) calls.push({ method: req.method, path: url.pathname.replace(P, ""), body });
      /* Stand-in for developers.cloudflare.com: a docs page with menus that must be ignored. */
      if (url.pathname.startsWith("/docs/")) {
        if (docsMode === "down") { res.writeHead(503); return res.end("down"); }
        res.writeHead(200, { "content-type": "text/html" });
        return res.end(`<html><body><nav>Menu Products Pricing</nav><main><h1>Docs for ${url.pathname}</h1><p>Turnstile is a free tool that checks visitors are human without puzzles.</p><p>To add it, create a widget, enter your site's address, and paste the site key into your form.</p><script>tracking()</script></main><footer>Footer links</footer></body></html>`);
      }
      if (url.pathname === "/__docs") { docsMode = url.searchParams.get("mode") || "ok"; res.writeHead(200); return res.end("{}"); }
      const [status, json] = await route(req.method, url.pathname + url.search, body, req.headers.authorization);
      if (status === 302) { res.writeHead(302, { location: json.location }); calls.push({ method: "OAUTH", path: "/oauth2/auth", body: json }); return res.end(); }
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(json));
    });
  })
  .listen(PORT, "127.0.0.1", () => console.log(`mock cloudflare on :${PORT}`));

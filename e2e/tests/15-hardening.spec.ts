import { expect, test } from "@playwright/test";
import { resetMock } from "./helpers";

test.beforeEach(resetMock);
const CSRF = { "X-Tamely": "1" };

test("pages carry strict security headers", async ({ request }) => {
  for (const path of ["/", "/learn", "/app", "/app/guide/turnstile"]) {
    const h = (await request.get(path)).headers();
    expect(h["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(h["x-frame-options"], path).toBe("DENY");
    expect(h["x-content-type-options"], path).toBe("nosniff");
    expect(h["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(h["access-control-allow-origin"], path).toBeUndefined();
  }
  /* Pages carry their exact script fingerprints in the header; nothing inline is allowed. */
  for (const path of ["/", "/learn", "/app"]) {
    const csp = (await request.get(path)).headers()["content-security-policy"];
    const script = csp.split(";").find((d) => d.trim().startsWith("script-src"))!;
    expect(script, path).toContain("'sha256-");
    expect(script, path).not.toContain("unsafe-inline");
    expect(csp, path).toContain("default-src 'self'");
  }
  const missing = await request.get("/no-such-page");
  expect(missing.status()).toBe(404);
  expect(missing.headers()["content-security-policy"]).toContain("default-src 'self'");
  const api = (await request.get("/api/v1/session")).headers();
  expect(api["content-security-policy"]).toBe("default-src 'none'; frame-ancestors 'none'");
  expect(api["cache-control"]).toBe("no-store");
});

test("forged, oversized and cross-site requests are refused", async ({ request }) => {
  expect((await request.post("/api/v1/session", { data: { token: "x" } })).status()).toBe(403);
  expect((await request.post("/api/v1/session", { headers: { ...CSRF, Origin: "https://evil.example" }, data: { token: "x" } })).status()).toBe(403);
  const big = await request.post("/api/v1/session", { headers: CSRF, data: { token: "a".repeat(200_000) } });
  expect(big.status()).toBe(413);
  expect(await big.json()).toMatchObject({ code: "too_big" });
  const preflight = await request.fetch("/api/v1/session", { method: "OPTIONS", headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" } });
  expect(preflight.headers()["access-control-allow-origin"]).toBeUndefined();
});

test("one visitor can't hammer the key check", async ({ request }) => {
  const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
  const codes: number[] = [];
  for (let i = 0; i < 14; i++) codes.push((await request.post("/api/v1/session", { headers: { ...CSRF, "CF-Connecting-IP": ip }, data: { token: "x" } })).status());
  expect(codes).toContain(429);
  expect(codes.slice(0, 10)).not.toContain(429);
});

test("errors never leak internals", async ({ request }) => {
  const r = await request.get("/api/v1/guides/%00%22<script>", { headers: CSRF });
  expect([401, 404]).toContain(r.status());
  const text = await r.text();
  expect(text).not.toMatch(/stack|at .*\.ts|Error:/);
});

test("the strict script policy blocks nothing the app itself needs", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => (window as any).__csp.push(`${e.violatedDirective} ${e.blockedURI} ${e.sample}`));
  });
  const blocked: string[] = [];
  const visit = async (path: string, ready: () => Promise<void>) => {
    await page.goto(path);
    await ready();
    blocked.push(...(await page.evaluate(() => (window as any).__csp as string[])).map((v) => `${path}: ${v}`));
  };
  await visit("/", () => page.getByRole("heading", { level: 1 }).first().waitFor());
  await visit("/learn", () => page.getByRole("heading", { level: 1 }).first().waitFor());
  const { connect } = await import("./helpers");
  await connect(page);
  await visit("/app", () => page.getByRole("region", { name: "Briefing" }).getByText("5,523").waitFor());
  await visit("/app/visitors", () => page.locator("svg path").first().waitFor());
  await visit("/app/explore", () => page.locator("[class*=brick]").first().waitFor());
  await visit("/app/guide/turnstile", () => page.getByTestId("guide").waitFor());
  expect(blocked).toEqual([]);
});

test("www sends visitors to the main address", async ({ request }) => {
  const r = await request.get("/learn?x=1", { headers: { Host: "www.tamely.dev" }, maxRedirects: 0 });
  expect(r.status()).toBe(301);
  expect(r.headers().location).toBe("http://tamely.dev/learn?x=1");
});

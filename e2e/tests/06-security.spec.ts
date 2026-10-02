import { expect, test } from "@playwright/test";
import { connect, resetMock, writes } from "./helpers";

test.beforeEach(resetMock);

test.describe("API safety", () => {
  test("blocks writes without our header or from another origin", async ({ page }) => {
    await connect(page);
    const noHeader = await page.request.post("/api/v1/actions", { data: { kind: "clear_cache", zoneId: "a".repeat(32) } });
    expect(noHeader.status()).toBe(403);
    const foreign = await page.request.post("/api/v1/actions", { headers: { "X-Tamely": "1", Origin: "https://evil.example" }, data: { kind: "clear_cache", zoneId: "a".repeat(32) } });
    expect(foreign.status()).toBe(403);
    expect(await writes()).toHaveLength(0);
  });

  test("refuses websites outside the account and forged proposals", async ({ page }) => {
    await connect(page);
    const other = await page.request.post("/api/v1/actions", { headers: { "X-Tamely": "1" }, data: { kind: "clear_cache", zoneId: "f".repeat(32) } });
    expect(other.status()).toBe(404);
    const forged = await page.request.post("/api/v1/actions/confirm", { headers: { "X-Tamely": "1" }, data: { token: "eyJhIjoxfQ.bad" } });
    expect((await forged.json()).code).toBe("proposal_invalid");
    expect(await writes()).toHaveLength(0);
  });

  test("rejects tampered cookies and unknown API versions", async ({ page, context }) => {
    await connect(page);
    const c = (await context.cookies()).find((x) => x.name === "tamely_session")!;
    await context.addCookies([{ ...c, value: c.value.slice(0, -4) + "AAAA" }]);
    expect((await page.request.get("/api/v1/sites")).status()).toBe(401);
    expect((await page.request.get("/api/v2/sites")).status()).toBe(404);
  });

  test("blocks rule injection in redirects", async ({ page }) => {
    await connect(page);
    const r = await page.request.post("/api/v1/actions", { headers: { "X-Tamely": "1" }, data: { kind: "add_redirect", zoneId: "a".repeat(32), from: '/x" or true or "', to: "https://ok.example" } });
    expect(r.status()).toBe(400);
    expect(await writes()).toHaveLength(0);
  });
});

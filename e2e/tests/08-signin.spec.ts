import { expect, test } from "@playwright/test";
import { MOCK, resetMock, shot } from "./helpers";

test.beforeEach(resetMock);
const mode = (m: string) => fetch(`${MOCK}/__oauth?mode=${m}`);

test.describe("Sign in with Cloudflare", () => {
  test("one button: approve on Cloudflare, land in the app", async ({ page, context }, info) => {
    await page.goto("/app");
    const btn = page.getByRole("link", { name: "Sign in with Cloudflare" });
    await expect(btn).toBeVisible();
    await shot(page, info, "24-signin-button");
    await btn.click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("status").filter({ hasText: "Connected to Shayeb's account" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Briefing" })).toContainText("5,523");
    const calls = await (await fetch(`${MOCK}/__calls`)).json();
    const auth = calls.find((c: any) => c.method === "OAUTH");
    for (const s of ["offline_access", "dns.write", "ai.read", "ai.write", "zone-settings.write", "dynamic-redirect.write"]) expect(auth.body.scope.split(" ")).toContain(s);
    expect(auth.body.challenge).toBeTruthy();
    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === "tamely_session")!;
    const refresh = cookies.find((c) => c.name === "tamely_refresh")!;
    expect(session.httpOnly && refresh.httpOnly).toBe(true);
    expect(refresh.path).toBe("/api/");
    expect(session.value).not.toContain("GOOD_TOKEN");
    expect(refresh.value).not.toContain("MOCK_REFRESH");
    await shot(page, info, "25-signin-landed");
  });

  test("declining on Cloudflare explains what happened", async ({ page }) => {
    await mode("deny");
    await page.goto("/app");
    await page.getByRole("link", { name: "Sign in with Cloudflare" }).click();
    await expect(page.getByText("You chose not to allow access")).toBeVisible();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("a forged callback is refused", async ({ page }) => {
    await page.goto("/api/v1/auth/cloudflare/callback?code=MOCK_CODE&state=forged");
    await expect(page.getByText("That sign-in took too long")).toBeVisible();
    expect((await page.request.get("/api/v1/sites")).status()).toBe(401);
  });

  test("short-lived access is renewed quietly", async ({ page }) => {
    await mode("short");
    await page.goto("/app");
    await page.getByRole("link", { name: "Sign in with Cloudflare" }).click();
    await expect(page.getByRole("region", { name: "Briefing" })).toContainText("5,523");
    const state = await (await fetch(`${MOCK}/__oauth?mode=ok`)).json();
    expect(state.refreshes).toBeGreaterThan(0);
  });

  test("local runs move sign-in from localhost to 127.0.0.1, which Cloudflare accepts", async ({ request }) => {
    const res = await request.get("http://localhost:8788/api/v1/auth/cloudflare/start", { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers().location).toBe("http://127.0.0.1:8788/api/v1/auth/cloudflare/start");
  });
});

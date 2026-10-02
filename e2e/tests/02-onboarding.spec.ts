import { expect, test } from "@playwright/test";
import { GOOD_TOKEN, resetMock, shot } from "./helpers";

test.beforeEach(resetMock);

test.describe("Onboarding", () => {
  test("the Cloudflare button pre-fills all 13 permissions, Workers AI included", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("button", { name: "Or connect with a key instead" }).click();
    const href = await page.getByRole("link", { name: /Open Cloudflare/ }).getAttribute("href");
    const url = new URL(href!);
    expect(url.origin + url.pathname).toBe("https://dash.cloudflare.com/profile/api-tokens");
    const keys = JSON.parse(url.searchParams.get("permissionGroupKeys")!);
    expect(keys).toHaveLength(13);
    expect(keys).toEqual(expect.arrayContaining([{ key: "ai", type: "read" }, { key: "ai", type: "edit" }, { key: "dns", type: "edit" }, { key: "dynamic_redirect", type: "edit" }]));
    expect(url.searchParams.get("name")).toBe("Tamely");
    expect(await page.getByRole("link", { name: /Open Cloudflare/ }).getAttribute("target")).toBe("_blank");
  });

  test("explains a wrong token in plain words", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("button", { name: "Or connect with a key instead" }).click();
    await page.getByPlaceholder("Paste your token").fill("WRONG_TOKEN_abcdefghijklmnopqrstuvwxyz");
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Cloudflare didn't accept this token");
  });

  test("connects, checks every feature, and opens the app", async ({ page, context }, info) => {
    await page.goto("/#connect");
    await page.getByRole("button", { name: "Or connect with a key instead" }).click();
    await shot(page, info, "05-connect-steps");
    await page.getByRole("button", { name: "What can it do?" }).click();
    await expect(page.getByText("Run the free assistant on your account")).toBeVisible();
    await page.getByPlaceholder("Paste your token").fill(GOOD_TOKEN);
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    const checks = page.getByRole("list", { name: "Setup check" });
    await expect(page.getByText("Connected to")).toBeVisible();
    await expect(checks.getByRole("listitem")).toHaveCount(7);
    await expect(checks.locator('[data-ok="true"]')).toHaveCount(7);
    await expect(checks).toContainText("Free assistant (Cloudflare AI)");
    await shot(page, info, "06-connect-checks");
    const cookie = (await context.cookies()).find((c) => c.name === "tamely_session")!;
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Strict");
    expect(cookie.value).not.toContain("GOOD_TOKEN");
    await page.getByRole("link", { name: "Open Tamely" }).click();
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
  });
});

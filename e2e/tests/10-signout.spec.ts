import { expect, test, type BrowserContext } from "@playwright/test";
import { seal } from "../../be/src/shared/lib/crypto";
import { connect, GOOD_TOKEN, resetMock, shot } from "./helpers";

const BASE = "http://127.0.0.1:8788";

test.beforeEach(resetMock);
const WEEK_S = 7 * 24 * 3600;

test.describe("Signing out", () => {
  test("sessions last 7 days, and sign out offers this device or every device", async ({ page, context }, info) => {
    await connect(page);
    await page.goto("/app");
    const session = (await context.cookies()).find((c) => c.name === "tamely_session")!;
    expect(Math.abs(session.expires - (Date.now() / 1000 + WEEK_S))).toBeLessThan(120);

    await page.getByRole("button", { name: "Sign out" }).click();
    const sheet = page.getByRole("dialog", { name: "Sign out" });
    await expect(sheet).toContainText("Tamely keeps nothing on its servers");
    const everywhere = sheet.getByRole("link", { name: "Sign out everywhere" });
    await expect(everywhere).toHaveAttribute("href", "https://dash.cloudflare.com/profile/api-tokens");
    await expect(everywhere).toHaveAttribute("target", "_blank");
    await expect(sheet).toContainText("find the key you made for Tamely");
    await shot(page, info, "30-sign-out-sheet");

    await sheet.getByRole("button", { name: "Sign out" }).click();
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("link", { name: "Sign in with Cloudflare" })).toBeVisible();
    expect((await context.cookies()).find((c) => c.name === "tamely_session")).toBeUndefined();
  });

  test("Cloudflare sign-ins point to Cloudflare's revoke page", async ({ page, context }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "Sign in with Cloudflare" }).click();
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    const sheet = page.getByRole("dialog", { name: "Sign out" });
    await expect(sheet.getByRole("link", { name: "Sign out everywhere" })).toHaveAttribute("href", "https://dash.cloudflare.com/?to=/profile/access-management/authorization");
    await expect(sheet).toContainText("find Tamely and choose Revoke");

    /* Clicking it opens Cloudflare in a new tab and signs this browser out too. */
    await context.route("https://dash.cloudflare.com/**", (r) => r.fulfill({ body: "cloudflare" }));
    const [tab] = await Promise.all([context.waitForEvent("page"), sheet.getByRole("link", { name: "Sign out everywhere" }).click()]);
    await tab.close();
    await expect(page.getByRole("link", { name: "Sign in with Cloudflare" })).toBeVisible();
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).not.toContain("tamely_session");
    expect(names).not.toContain("tamely_refresh");
  });
});

test.describe("Session lifetime is enforced by the server", () => {
  const SECRET = "e2e-only-secret-0123456789abcdefghijklmnop";
  const DAY = 24 * 3600 * 1000;
  const forge = async (extra: Record<string, unknown>) =>
    seal({ token: GOOD_TOKEN, accountId: "c".repeat(32), accountName: "Shayeb's account", kind: "token", ...extra }, SECRET);
  const status = async (context: BrowserContext, value: string) => {
    await context.addCookies([{ name: "tamely_session", value, url: BASE }]);
    const res = await context.request.get("/api/v1/session");
    return { body: await res.json(), setCookie: res.headers()["set-cookie"] || "" };
  };

  test("a week-old or pre-upgrade cookie is refused, an active one is renewed", async ({ context }) => {
    expect((await status(context, await forge({ seen: Date.now() - 8 * DAY }))).body.connected).toBe(false);
    expect((await status(context, await forge({}))).body.connected).toBe(false);
    const fresh = await status(context, await forge({ seen: Date.now() - 2 * DAY }));
    expect(fresh.body.connected).toBe(true);
    expect(fresh.setCookie).toMatch(/tamely_session=.+Max-Age=604800/);
    const today = await status(context, await forge({ seen: Date.now() - 60_000 }));
    expect(today.body.connected).toBe(true);
    expect(today.setCookie).not.toContain("tamely_session=");
  });
});

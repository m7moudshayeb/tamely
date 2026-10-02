import { expect, test, type Page } from "@playwright/test";
import { connect, MOCK, resetMock, shot } from "./helpers";

const menu = (page: Page) => page.getByRole("complementary", { name: "Main menu" });
const aiCalls = async () => (await (await fetch(`${MOCK}/__calls`)).json()).filter((c: any) => c.path.includes("/ai/v1/chat/completions")).length;

test.beforeEach(async ({ page }) => {
  await resetMock();
  await connect(page);
  await page.goto("/app");
  await page.evaluate(() => localStorage.setItem("tamely.sidebar.v1", JSON.stringify({ hidden: [], pins: ["turnstile"], order: [] })));
  await page.reload();
});

test("a link added from Everything else opens a plain guide in Tamely", async ({ page }, info) => {
  await menu(page).getByRole("link", { name: "Human check for forms" }).click();
  await expect(page).toHaveURL(/\/app\/guide\/turnstile$/);
  await expect(page.getByRole("heading", { name: "Human check for forms" })).toBeVisible();
  await expect(page.getByText("Application security → Turnstile")).toBeVisible();

  const guide = page.getByTestId("guide");
  await expect(guide).toContainText("How to use it");
  await expect(guide).toContainText("Paste the site key into your form");
  await expect(guide).not.toContainText("LEAKED PAGE CHROME");
  await expect(guide.getByRole("link", { name: /Cloudflare docs/ }).first()).toHaveAttribute("href", "https://developers.cloudflare.com/turnstile/");

  await expect(page.getByRole("link", { name: "Open on Cloudflare" })).toHaveAttribute("href", /^https:\/\/dash\.cloudflare\.com\/c{32}\/turnstile$/);
  await expect(page.getByRole("link", { name: "Open on Cloudflare" })).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "Official docs" })).toHaveAttribute("href", "https://developers.cloudflare.com/turnstile/");
  await expect(page.getByRole("button", { name: "In your sidebar" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "More in Protection" }).getByRole("link", { name: "Security settings" })).toHaveAttribute("href", "/app/protection");
  await shot(page, info, "38-guide");

  /* Reopening within 30 minutes doesn't spend the AI allowance again. */
  const before = await aiCalls();
  await page.reload();
  await expect(page.getByTestId("guide")).toContainText("Paste the site key into your form");
  expect(await aiCalls()).toBe(before);

  await page.getByRole("button", { name: "Ask about this" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByText("How do I use Human check for forms on Cloudflare?")).toBeVisible();
});

test("if Cloudflare's docs can't be read, it says so and can try again", async ({ page }) => {
  await fetch(`${MOCK}/__docs?mode=down`);
  await page.goto("/app/guide/turnstile");
  await expect(page.getByRole("alert")).toContainText("Couldn't read Cloudflare's docs");
  await expect(page.getByRole("link", { name: "Open on Cloudflare" })).toBeVisible();
  await fetch(`${MOCK}/__docs?mode=ok`);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByTestId("guide")).toContainText("How to use it");
});

test("an unknown guide shows a friendly way back", async ({ page }) => {
  await page.goto("/app/guide/not-a-real-page");
  await expect(page.getByText("We couldn't find that page")).toBeVisible();
  const res = await page.request.get("/api/v1/guides/..%2F..%2Fetc", { headers: { "X-Tamely": "1" } });
  expect(res.status()).toBe(404);
});

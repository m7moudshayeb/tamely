import { expect, test } from "@playwright/test";
import { connect, resetMock, shot } from "./helpers";

test.beforeEach(resetMock);

test("Connect from the Learn page goes to the connect section", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "Connect", exact: true }).click();
  await expect(page).toHaveURL(/\/#connect$/);
  await expect(page.getByRole("heading", { name: "Connect in about two minutes." })).toBeInViewport();
});

test("people already connected see Open app instead of Connect", async ({ page }) => {
  await connect(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Open app" })).toHaveAttribute("href", "/app");
  await expect(page.getByRole("link", { name: "Open your dashboard" })).toHaveAttribute("href", "/app");
});

test("Everything else: masonry cards and a question box at the bottom", async ({ page }, info) => {
  await connect(page);
  await page.goto("/app/explore");
  await page.locator("[class*=brick]").first().waitFor();
  const xs = await page.locator("[class*=brick]").evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().left)))]);
  expect(xs.length).toBeGreaterThanOrEqual(2);
  await shot(page, info, "26-explore-masonry");
});

test("Everything else: questions about this page highlight the right topics", async ({ page }, info) => {
  await connect(page);
  await page.goto("/app/explore");
  const box = page.getByRole("textbox", { name: "Message the assistant" });
  await box.fill("How do I stop spam on my contact form?");
  await box.press("Enter");

  const bar = page.getByRole("region", { name: "Found on this page" });
  await expect(bar).toContainText("“How do I stop spam on my contact form?”");
  await expect(page).toHaveURL(/\/app\/explore$/);
  const best = page.locator('[data-page-id="turnstile"]');
  await expect(best).toHaveAttribute("data-highlighted", "true");
  await expect(best).toBeInViewport();
  await expect(page.getByRole("region", { name: "Data & files" })).toHaveCSS("opacity", "0.4");
  await expect(page.getByRole("region", { name: "Protection" })).toHaveCSS("opacity", "1");
  await shot(page, info, "35-explore-find");

  await bar.getByRole("button", { name: "Fake signup protection" }).click();
  await expect(page.locator('[data-highlighted="true"]').filter({ hasText: "Fake signup protection" })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(bar).toBeHidden();
  await expect(page.locator("[data-highlighted]")).toHaveCount(0);

  /* Questions about their own data can still go to the assistant in one tap. */
  await box.fill("How is my traffic doing this week?");
  await box.press("Enter");
  await expect(bar).toContainText("Traffic");
  await bar.getByRole("button", { name: "Ask the assistant" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByTestId("assistant-message").last()).toContainText("Traffic is up this week");
});

test("Everything else: questions that match nothing here go straight to the assistant", async ({ page }) => {
  await connect(page);
  await page.goto("/app/explore");
  const box = page.getByRole("textbox", { name: "Message the assistant" });
  await box.fill("hello there");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByTestId("assistant-message").last()).toBeVisible();
});

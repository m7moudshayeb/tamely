import { expect, test } from "@playwright/test";
import { connect, resetMock, shot, writes, ZONE } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetMock();
  await connect(page);
});

test("briefing shows numbers, cited issues and one-tap fixes", async ({ page }, info) => {
  await page.goto("/app");
  const panel = page.getByRole("region", { name: "Briefing" });
  await expect(panel).toContainText("2 things need a look");
  await expect(panel).toContainText("Visitors · 7 days");
  await expect(panel).toContainText("5,523");
  await shot(page, info, "07-home-briefing");

  const dev = panel.getByTestId("briefing-item").filter({ hasText: "Development mode is on" });
  const sources = await dev.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(sources).toEqual(expect.arrayContaining([expect.stringMatching(/^\/app\/speed$/), expect.stringMatching(/dash\.cloudflare\.com\/c{32}\/babara\.app\/caching\/configuration$/), expect.stringMatching(/developers\.cloudflare\.com/)]));

  await dev.getByRole("button", { name: "Fix it" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Development mode is now off." })).toBeVisible();
  await expect(panel).toContainText("One thing needs a look");
  expect(await writes()).toContainEqual({ method: "PATCH", path: `/zones/${ZONE}/settings/development_mode`, body: { value: "off" } });
  await shot(page, info, "08-briefing-fixed");
});

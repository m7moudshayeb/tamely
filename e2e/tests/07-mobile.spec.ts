import { expect, test } from "@playwright/test";
import { connect, nothingCutOff, noHorizontalScroll, resetMock, shot } from "./helpers";

test.use({ viewport: { width: 390, height: 844 } });
test.beforeEach(resetMock);

test("app works on a phone: menu, briefing and chat", async ({ page }, info) => {
  await connect(page);
  await page.goto("/app");
  await expect(page.getByRole("region", { name: "Briefing" })).toBeVisible();
  await noHorizontalScroll(page);
  await nothingCutOff(page);
  await shot(page, info, "22-phone-home");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Protection" }).click();
  await expect(page.getByRole("heading", { name: "Protection" })).toBeVisible();
  await noHorizontalScroll(page);
  await nothingCutOff(page);
  await shot(page, info, "23-phone-protection");
});

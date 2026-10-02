import { expect, test, type Page } from "@playwright/test";
import { connect, resetMock } from "./helpers";

const menu = (page: Page) => page.getByRole("complementary", { name: "Main menu" });
const thread = (page: Page) => page.getByTestId("assistant-message");
const ask = async (page: Page, q: string) => {
  const box = page.getByRole("textbox", { name: "Message the assistant" });
  await box.fill(q);
  await box.press("Enter");
};

test.beforeEach(async ({ page }) => {
  await resetMock();
  await connect(page);
  await page.goto("/app");
});

test("the chat survives moving around, even mid-answer, and reloads", async ({ page }) => {
  await ask(page, "How is my traffic doing this week, slowly?");
  await expect(page.getByText("Reading your visitor numbers")).toBeVisible();
  await menu(page).getByRole("link", { name: "Speed" }).click();
  await expect(page).toHaveURL(/\/app\/speed$/);
  await menu(page).getByRole("link", { name: "Ask & briefing" }).click();
  await expect(thread(page).last()).toContainText("Traffic is up this week");
  await expect(page.getByText("How is my traffic doing this week, slowly?")).toBeVisible();

  await page.reload();
  await expect(thread(page).last()).toContainText("Traffic is up this week");

  await page.getByRole("button", { name: "New chat" }).click();
  await expect(thread(page)).toHaveCount(0);
  await page.reload();
  await expect(thread(page)).toHaveCount(0);
});

test("a chat older than 30 quiet minutes is wiped", async ({ page }) => {
  await ask(page, "How is my traffic doing this week?");
  await expect(thread(page).last()).toContainText("Traffic is up this week");
  await page.evaluate(() => {
    const all = JSON.parse(sessionStorage.getItem("tamely.chat.v1") || "{}");
    for (const t of Object.values<any>(all)) t.updatedAt = Date.now() - 31 * 60 * 1000;
    sessionStorage.setItem("tamely.chat.v1", JSON.stringify(all));
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
  await expect(thread(page)).toHaveCount(0);
});

test("signing out wipes the chat and it never leaves this tab", async ({ page, context }) => {
  await ask(page, "How is my traffic doing this week?");
  await expect(thread(page).last()).toContainText("Traffic is up this week");
  expect(await page.evaluate(() => localStorage.getItem("tamely.chat.v1"))).toBeNull();

  const other = await context.newPage();
  await other.goto("/app");
  await expect(other.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
  await expect(other.getByTestId("assistant-message")).toHaveCount(0);
  await other.close();

  await menu(page).getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("dialog", { name: "Sign out" }).getByRole("button", { name: "Sign out" }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("tamely.chat.v1"))).toBe("{}");
});

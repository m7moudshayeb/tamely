import { expect, test } from "@playwright/test";
import { connect, resetMock, shot, writes, ZONE } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetMock();
  await connect(page);
  await page.goto("/app");
});

const ask = async (page: import("@playwright/test").Page, q: string) => {
  const box = page.getByRole("textbox", { name: "Message the assistant" });
  await box.fill(q);
  await box.press("Enter");
};

test("answers with visible steps, numbered how-to, citations, and a Confirm card", async ({ page }, info) => {
  await ask(page, "Point www to my Vercel site");
  const msg = page.getByTestId("assistant-message").last();
  const steps = msg.getByRole("list", { name: "What the assistant did" });
  await expect(steps).toContainText("Checking your address records");
  await expect(steps).toContainText("Preparing the change");
  await expect(msg.getByRole("list", { name: "Steps" }).getByRole("listitem")).toHaveCount(3);
  const cite = msg.getByRole("link", { name: /^Source 1:/ });
  await expect(cite).toHaveAttribute("href", "/app/address");
  await expect(msg.locator('a[data-kind="docs"]')).toHaveAttribute("href", /developers\.cloudflare\.com/);
  const card = msg.getByTestId("proposal");
  await expect(card).toContainText("Make www.babara.app point to cname.vercel-dns.com");
  expect((await writes()).length).toBe(0); // nothing changes before Confirm
  await shot(page, info, "09-chat-proposal");
  await card.getByRole("button", { name: "Confirm" }).click();
  await expect(card).toContainText("Record added");
  expect(await writes()).toContainEqual({ method: "POST", path: `/zones/${ZONE}/dns_records`, body: { type: "CNAME", name: "www", content: "cname.vercel-dns.com", proxied: false, ttl: 1 } });
  await cite.click();
  await expect(page).toHaveURL(/\/app\/address$/);
  await expect(page.getByText("Goes to cname.vercel-dns.com")).toBeVisible();
});

test("no traffic chart when the answer isn't about visitors", async ({ page }) => {
  await ask(page, "Is my padlock ok?");
  const msg = page.getByTestId("assistant-message").last();
  await expect(msg).toContainText("Your secure padlock is set up and working");
  await expect(msg.getByRole("img", { name: "Visitors over time" })).toHaveCount(0);
});

test("shows a traffic chart when it looks at visitor numbers", async ({ page }, info) => {
  await ask(page, "How is my traffic doing this week?");
  const msg = page.getByTestId("assistant-message").last();
  await expect(msg).toContainText("Traffic is up this week");
  await expect(msg.getByRole("img", { name: "Visitors over time" })).toBeVisible();
  await expect(msg.locator("svg path").first()).toBeVisible();
  await shot(page, info, "10-chat-traffic-chart");
});

test("only links to sources it actually looked up", async ({ page }, info) => {
  await ask(page, "How do I put a login on my admin page?");
  const msg = page.getByTestId("assistant-message").last();
  await expect(msg).toContainText("Cloudflare Access");
  const hrefs = await msg.locator("a").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
  expect(hrefs.some((h) => h.includes("evil.example"))).toBe(false);
  expect(hrefs).toContain(`https://dash.cloudflare.com/${"c".repeat(32)}/babara.app/access`);
  await expect(msg).not.toContainText("[S99]");
  await expect(msg.getByRole("link", { name: /^Source 3:/ })).toHaveCount(0);
  await shot(page, info, "11-chat-help-cited");
});

test("explains running out of free AI and keeps the rest working", async ({ page }, info) => {
  await ask(page, "limit test");
  const msg = page.getByTestId("assistant-message").last();
  await expect(msg.getByRole("alert")).toContainText("free Cloudflare AI allowance");
  await expect(msg.getByRole("link", { name: "About the free allowance" })).toHaveAttribute("href", /workers-ai\/platform\/pricing/);
  await expect(page.getByRole("region", { name: "Briefing" })).toContainText("5,523");
  await shot(page, info, "12-chat-ai-limit");
});

test("shows it's working while the answer is being written", async ({ page }) => {
  await ask(page, "How is my traffic doing this week? Answer slowly");
  const msg = page.getByTestId("assistant-message").last();
  await expect(msg.getByRole("status")).toContainText(/Putting it together|Thinking/);
  await expect(msg).toContainText("Traffic is up this week", { timeout: 10_000 });
  await expect(msg.getByRole("status")).toHaveCount(0);
});

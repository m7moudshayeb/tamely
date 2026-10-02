import { expect, test, type Page } from "@playwright/test";
import { connect, resetMock, shot } from "./helpers";

const sidebar = (page: Page) => page.getByRole("complementary", { name: "Main menu" });
const row = (page: Page, title: string) => page.getByRole("listitem").filter({ has: page.locator("b").filter({ hasText: new RegExp(`^${title}`) }) });

/** Which sidebar heading a link sits under ("" for the top group). */
const sectionOf = (page: Page, name: string) =>
  page.evaluate((label) => {
    let heading = "";
    for (const el of document.querySelectorAll("aside nav > *")) {
      if (el.tagName === "P") heading = el.textContent?.trim() || "";
      else if ([...el.querySelectorAll("a")].some((a) => a.textContent?.trim() === label)) return heading;
    }
    return null;
  }, name);

test.beforeEach(async ({ page }) => {
  await resetMock();
  await connect(page);
});

test.describe("Adjustable sidebar", () => {
  test("pin a page from Everything else, remove items, send them back", async ({ page }, info) => {
    const writes: string[] = [];
    page.on("request", (r) => r.url().includes("/api/") && r.method() !== "GET" && writes.push(r.url()));
    await page.goto("/app/explore");

    const containers = row(page, "Containers");
    await containers.hover();
    await containers.getByRole("button", { name: "Add Containers to the sidebar" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Containers is in your sidebar." })).toBeVisible();
    const pinned = sidebar(page).getByRole("link", { name: "Containers" });
    await expect(pinned).toHaveAttribute("href", "/app/guide/containers");
    await expect.poll(() => sectionOf(page, "Containers")).toBe("Your shortcuts");
    await shot(page, info, "31-sidebar-pinned");

    await page.reload();
    await expect(sidebar(page).getByRole("link", { name: "Containers" })).toBeVisible();

    await sidebar(page).getByRole("button", { name: "Edit sidebar" }).click();
    for (const fixed of ["Ask & briefing", "Everything else", "Setup & help"]) await expect(sidebar(page).getByRole("button", { name: `Remove ${fixed} from the sidebar` })).toHaveCount(0);
    await shot(page, info, "32-sidebar-editing");
    await sidebar(page).getByRole("button", { name: "Remove Email from the sidebar" }).click();
    await sidebar(page).getByRole("button", { name: "Remove Containers from the sidebar" }).click();
    await sidebar(page).getByRole("button", { name: "Done" }).click();
    await expect(sidebar(page).getByRole("link", { name: "Email" })).toHaveCount(0);
    await expect(sidebar(page).getByRole("link", { name: "Add from Everything else" })).toBeVisible();

    /* Removed items are still in Everything else, and come back with one tap. */
    const forward = row(page, "Forward email");
    await forward.hover();
    await forward.getByRole("button", { name: "Add Email to the sidebar" }).click();
    await expect(sidebar(page).getByRole("link", { name: "Email" })).toBeVisible();
    await expect(forward.getByRole("button", { name: "Remove Email from the sidebar" })).toHaveAttribute("aria-pressed", "true");
    expect(writes).toEqual([]);
  });

  test("reset restores the default sidebar", async ({ page }) => {
    await page.goto("/app");
    await sidebar(page).getByRole("button", { name: "Edit sidebar" }).click();
    for (const name of ["Speed", "Redirects", "Visitors"]) await sidebar(page).getByRole("button", { name: `Remove ${name} from the sidebar` }).click();
    await expect(sidebar(page).getByRole("link", { name: "Speed" })).toHaveCount(0);
    await sidebar(page).getByRole("button", { name: "Reset" }).click();
    for (const name of ["Speed", "Redirects", "Visitors"]) await expect(sidebar(page).getByRole("link", { name })).toBeVisible();
    await expect(sidebar(page).getByRole("button", { name: "Reset" })).toHaveCount(0);
  });

  test("bad saved data falls back to the default sidebar", async ({ page }) => {
    await page.goto("/app");
    await page.evaluate(() => localStorage.setItem("tamely.sidebar.v1", JSON.stringify({ hidden: ["/app", "/app/explore", "/evil", 5], pins: ["<script>", "nope", "containers", "containers"] })));
    await page.reload();
    for (const name of ["Ask & briefing", "Everything else", "Setup & help", "Email"]) await expect(sidebar(page).getByRole("link", { name })).toBeVisible();
    await expect(sidebar(page).getByRole("link", { name: "Containers" })).toHaveCount(1);
    await page.evaluate(() => localStorage.setItem("tamely.sidebar.v1", "{not json"));
    await page.reload();
    await expect(sidebar(page).getByRole("link", { name: "Email" })).toBeVisible();
  });
});

test("the assistant can rearrange the sidebar, with Confirm and Undo", async ({ page }, info) => {
  await page.goto("/app");
  await page.getByRole("textbox", { name: "Message the assistant" }).fill("Can you remove the Emails link from my sidebar and put Web Analytics and R2 there instead?");
  await page.keyboard.press("Enter");
  const card = page.getByTestId("sidebar-change");
  await expect(card).toContainText("Update your sidebar");
  await expect(card).toContainText("Remove Email");
  await expect(card).toContainText("Add Visitors (already there)");
  await expect(card).toContainText("Add File storage");
  await expect(card).not.toContainText("Ask & briefing");
  await expect(sidebar(page).getByRole("link", { name: "Email" })).toBeVisible();
  await shot(page, info, "33-chat-sidebar-change");

  await card.getByRole("button", { name: "Confirm" }).click();
  await expect(card).toContainText("Your sidebar is updated.");
  await expect(sidebar(page).getByRole("link", { name: "Email" })).toHaveCount(0);
  await expect(sidebar(page).getByRole("link", { name: "File storage" })).toHaveAttribute("href", "/app/guide/r2");
  await expect(sidebar(page).getByRole("link", { name: "Visitors" })).toBeVisible();
  await shot(page, info, "34-chat-sidebar-applied");

  await card.getByRole("button", { name: "Undo" }).click();
  await expect(sidebar(page).getByRole("link", { name: "Email" })).toBeVisible();
  await expect(sidebar(page).getByRole("link", { name: "File storage" })).toHaveCount(0);
});

test("in edit mode, links can be reordered by dragging the handle or with the keyboard", async ({ page }, info) => {
  await page.goto("/app");
  const siteLinks = () => sidebar(page).getByRole("link").evaluateAll((as) => as.map((a) => a.textContent?.trim()));
  /* Handles appear only while editing. */
  await expect(sidebar(page).getByRole("link", { name: "Speed" })).toBeVisible();
  await expect(sidebar(page).getByRole("button", { name: /^Move / })).toHaveCount(0);
  await sidebar(page).getByRole("button", { name: "Edit sidebar" }).click();
  for (const name of ["Visitors", "Speed", "Email", "Apps"]) await expect(sidebar(page).getByRole("button", { name: `Move ${name}`, exact: true })).toBeVisible();

  /* Drag Speed above Your address. */
  const handle = sidebar(page).getByRole("button", { name: "Move Speed", exact: true });
  const target = sidebar(page).getByRole("button", { name: "Move Your address", exact: true });
  const from = (await handle.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, from.y - 6, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, to.y + 2, { steps: 12 });
  await page.mouse.up();
  await expect.poll(async () => { const o = await siteLinks(); return o.indexOf("Speed") < o.indexOf("Your address"); }).toBe(true);
  const order = await siteLinks();
  await shot(page, info, "36-sidebar-reorder");

  /* Keyboard: move Redirects up one place. */
  const before = order.indexOf("Redirects");
  await sidebar(page).getByRole("button", { name: "Move Redirects", exact: true }).focus();
  for (const key of ["Space", "ArrowUp", "Space"]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(200);
  }
  await expect.poll(async () => (await siteLinks()).indexOf("Redirects")).toBe(before - 1);

  await sidebar(page).getByRole("button", { name: "Done" }).click();
  await expect(sidebar(page).getByRole("button", { name: /^Move / })).toHaveCount(0);
  await sidebar(page).getByRole("link", { name: "Speed" }).click();
  await expect(page).toHaveURL(/\/app\/speed$/);
  await page.reload();
  await expect(sidebar(page).getByRole("link", { name: "Speed" })).toBeVisible();
  await expect.poll(async () => { const o = await siteLinks(); return o.indexOf("Speed") < o.indexOf("Your address"); }).toBe(true);

  await sidebar(page).getByRole("button", { name: "Edit sidebar" }).click();
  await sidebar(page).getByRole("button", { name: "Reset" }).click();
  await expect.poll(async () => { const o = await siteLinks(); return o.indexOf("Your address") < o.indexOf("Speed"); }).toBe(true);
});

test("removed screens come back in their own section; added pages go to Your shortcuts", async ({ page }, info) => {
  await page.goto("/app");
  await sidebar(page).getByRole("button", { name: "Edit sidebar" }).click();
  await sidebar(page).getByRole("button", { name: "Remove Speed from the sidebar" }).click();
  await sidebar(page).getByRole("button", { name: "Done" }).click();
  await sidebar(page).getByRole("link", { name: "Everything else", exact: true }).click();

  const speedCard = page.getByRole("region", { name: "Speed", exact: true });
  await speedCard.getByRole("button", { name: "Add Speed to the sidebar" }).filter({ hasText: "Add Speed" }).click();
  await expect.poll(() => sectionOf(page, "Speed")).toBe("This website");
  const links = await sidebar(page).getByRole("link").evaluateAll((as) => as.map((a) => a.textContent?.trim()));
  expect(links.indexOf("Speed")).toBe(links.indexOf("Protection") + 1);
  await expect(speedCard.getByRole("button", { name: "Remove Speed from the sidebar" }).filter({ hasText: "In sidebar" })).toHaveAttribute("aria-pressed", "true");

  const test1 = row(page, "Speed test");
  await test1.hover();
  await test1.getByRole("button", { name: "Add Speed test to the sidebar" }).click();
  await expect.poll(() => sectionOf(page, "Speed test")).toBe("Your shortcuts");
  const vector = row(page, "Vector database");
  await vector.hover();
  await vector.getByRole("button", { name: "Add Vector database to the sidebar" }).click();
  await expect.poll(() => sectionOf(page, "Vector database")).toBe("Your shortcuts");
  await shot(page, info, "37-sidebar-sections");
});

test("edit mode never scrolls sideways, even with long names", async ({ page }) => {
  await page.goto("/app");
  await page.evaluate(() => localStorage.setItem("tamely.sidebar.v1", JSON.stringify({ hidden: [], pins: ["observatory", "ssl-origin", "dns-analytics", "agent-diag", "vectorize"], order: [] })));
  await page.reload();
  await sidebar(page).getByRole("button", { name: "Edit sidebar" }).click();
  const nav = sidebar(page).getByRole("navigation");
  await expect.poll(() => nav.evaluate((n) => n.scrollWidth - n.clientWidth)).toBe(0);
  await expect(sidebar(page).getByRole("button", { name: "Done" })).toBeInViewport({ ratio: 1 });
  for (const b of await sidebar(page).getByRole("button", { name: /^Remove .* from the sidebar$/ }).all()) await expect(b).toBeInViewport({ ratio: 1 });
});

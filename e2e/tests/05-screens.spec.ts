import { expect, test } from "@playwright/test";
import { connect, resetMock, shot, writes, ZONE } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetMock();
  await connect(page);
});

test("address: add a record from a template, then delete one", async ({ page }, info) => {
  await page.goto("/app/address");
  await expect(page.getByText("Goes to the server at 192.0.2.1")).toBeVisible();
  await page.getByRole("button", { name: "Add a record" }).click();
  const sheet = page.getByRole("dialog", { name: "Add a record" });
  await sheet.getByRole("button", { name: /Start from a template/ }).click();
  await sheet.getByRole("option", { name: /Shopify store/ }).click();
  await expect(sheet.getByLabel("Points to")).toHaveValue("shops.myshopify.com");
  await shot(page, info, "13-address-add");
  await sheet.getByRole("button", { name: /What should it do/ }).click();
  await sheet.getByRole("option", { name: /Receive email/ }).click();
  await expect(sheet.getByLabel("Priority")).toBeVisible();
  await sheet.getByRole("button", { name: /What should it do/ }).click();
  await sheet.getByRole("option", { name: /Point to a service/ }).click();
  await sheet.getByLabel("Address").fill("shop");
  await sheet.getByRole("button", { name: "Add record" }).click();
  await expect(sheet).toBeHidden();
  expect(await writes()).toContainEqual({ method: "POST", path: `/zones/${ZONE}/dns_records`, body: { type: "CNAME", name: "shop", content: "shops.myshopify.com", proxied: false, ttl: 1 } });
  await page.getByRole("button", { name: "Delete app.babara.app" }).click();
  await page.getByRole("dialog", { name: "Delete this record?" }).getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("Goes to babara.pages.dev", { exact: true })).toBeHidden();
  await shot(page, info, "14-address-after");
});

test("address: catches a bad server address before Cloudflare sees it", async ({ page }) => {
  await page.goto("/app/address");
  await page.getByRole("button", { name: "Add a record" }).click();
  const sheet = page.getByRole("dialog", { name: "Add a record" });
  await sheet.getByRole("button", { name: /What should it do/ }).click();
  await sheet.getByRole("option", { name: /^Point to a server Your/ }).click();
  await sheet.getByLabel("Server IP address").fill("999.1.1.1");
  await sheet.getByRole("button", { name: "Add record" }).click();
  await expect(sheet.getByRole("alert")).toContainText("isn't a valid server address");
  expect(await writes()).toHaveLength(0);
});

test("protection: flip a switch with a plain explanation", async ({ page }, info) => {
  await page.goto("/app/protection");
  await expect(page.getByText("Encrypted all the way to your server.")).toBeVisible();
  const sw = page.getByRole("switch", { name: "Always use the secure address" });
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
  expect(await writes()).toContainEqual({ method: "PATCH", path: `/zones/${ZONE}/settings/always_use_https`, body: { value: "on" } });
  await shot(page, info, "15-protection");
});

test("speed: clear saved copies after confirming", async ({ page }, info) => {
  await page.goto("/app/speed");
  await page.getByRole("button", { name: "Clear saved copies" }).click();
  await page.getByRole("dialog", { name: "Clear saved copies?" }).getByRole("button", { name: "Clear now" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved copies cleared" })).toBeVisible();
  expect(await writes()).toContainEqual({ method: "POST", path: `/zones/${ZONE}/purge_cache`, body: { purge_everything: true } });
  await shot(page, info, "16-speed");
});

test("email and redirects: add with plain forms", async ({ page }, info) => {
  await page.goto("/app/email");
  await expect(page.getByText("Goes to owner@gmail.com")).toBeVisible();
  await page.getByLabel("New address").fill("support");
  await page.getByLabel("Send to inbox").fill("me@proton.me");
  await page.getByRole("button", { name: "Add forwarding" }).click();
  await expect(page.getByRole("status").filter({ hasText: "confirmation link" })).toBeVisible();
  await shot(page, info, "17-email");
  await page.goto("/app/redirects");
  await page.getByLabel("Old link").fill("/old-pricing");
  await page.getByLabel("New address").fill("https://babara.app/pricing");
  await page.getByRole("radio", { name: "For now (302)" }).click();
  await page.getByRole("button", { name: "Add redirect" }).click();
  await expect(page.getByText("Sends visitors to https://babara.app/pricing")).toBeVisible();
  const put = (await writes()).find((w) => w.path.endsWith("/entrypoint"));
  expect(put?.body.rules[0].action_parameters.from_value.status_code).toBe(302);
  await shot(page, info, "18-redirects");
});

test("visitors: switch range and metric", async ({ page }, info) => {
  await page.goto("/app/visitors");
  await expect(page.getByText("5,523").first()).toBeVisible();
  await page.getByRole("radio", { name: "24 hours" }).click();
  await expect(page.getByRole("img", { name: "Visitors over time" })).toBeVisible();
  await page.getByRole("radio", { name: "Threats" }).click();
  await expect(page.getByRole("img", { name: "Threats blocked over time" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Requests by country" })).toContainText("United States");
  await shot(page, info, "19-visitors");
});

test("everything else: search the whole dashboard in plain words", async ({ page }, info) => {
  await page.goto("/app/explore");
  await page.getByPlaceholder(/block a country/).fill("block a country");
  const first = page.getByRole("link", { name: /Block & allow rules/ });
  await expect(first).toHaveAttribute("href", `https://dash.cloudflare.com/${"c".repeat(32)}/babara.app/security/security-rules`);
  await expect(first).toHaveAttribute("target", "_blank");
  await shot(page, info, "20-explore");
});

test("setup & help: explains the key and the free AI", async ({ page }, info) => {
  await page.goto("/app/setup");
  await expect(page.getByRole("list", { name: "Setup check" }).locator('[data-ok="true"]')).toHaveCount(7);
  await expect(page.getByRole("link", { name: /Create a new key/ })).toHaveAttribute("href", /permissionGroupKeys/);
  await expect(page.getByText("10,000 free units every day")).toBeVisible();
  await shot(page, info, "21-setup");
});

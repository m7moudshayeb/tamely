import { expect, test } from "@playwright/test";
import { nothingCutOff, noHorizontalScroll, shot } from "./helpers";

test.describe("Landing page", () => {
  test("hero fills the screen and leads to connect", async ({ page }, info) => {
    await page.goto("/");
    const hero = page.locator("section.hero, section").first();
    const box = await hero.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(880);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("in plain words");
    await shot(page, info, "01-landing-hero");
    await page.getByRole("link", { name: /Connect in 2 minutes/ }).click();
    await expect(page.getByRole("heading", { name: "Connect in about two minutes." })).toBeInViewport();
    await shot(page, info, "02-landing-connect");
  });

  test("SEO, GEO and AEO basics are in place", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Tamely/);
    expect(await page.locator('meta[name="description"]').getAttribute("content")).toMatch(/plain words/);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https:\/\//);
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toMatch(/og\.png$/);
    const types = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent || "{}")["@type"]));
    expect(types).toEqual(expect.arrayContaining(["SoftwareApplication", "HowTo"]));
    const llms = await (await request.get("/llms.txt")).text();
    expect(llms).toContain("# Tamely");
    expect(llms).toContain("Address records (Cloudflare: DNS › Records)");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /app");
    expect((await request.get("/sitemap-index.xml")).ok()).toBeTruthy();
  });

  test("learn page explains every term with an official docs link", async ({ page }, info) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("plain words");
    const docs = await page.locator("article a").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(docs.length).toBeGreaterThanOrEqual(15);
    for (const d of docs) expect(d).toMatch(/^https:\/\/developers\.cloudflare\.com\//);
    await shot(page, info, "03-learn");
  });

  test("works on a phone without sideways scrolling", async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await noHorizontalScroll(page);
  await nothingCutOff(page);
    await nothingCutOff(page);
    await shot(page, info, "04-landing-phone");
  });
});

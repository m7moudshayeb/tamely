import { expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const MOCK = "http://127.0.0.1:8790";
export const GOOD_TOKEN = "GOOD_TOKEN_abcdefghijklmnopqrstuvwxyz";
export const ZONE = "a".repeat(32);
const SHOTS = path.join(import.meta.dirname, "..", "artifacts", "screens");

export async function resetMock() {
  await fetch(`${MOCK}/__reset`);
}

/** Every write the Worker sent to Cloudflare (GET calls excluded). */
export async function writes(): Promise<{ method: string; path: string; body: any }[]> {
  const calls = await (await fetch(`${MOCK}/__calls`)).json();
  return calls.filter((c: any) => c.method !== "GET" && c.method !== "OAUTH" && c.path !== "/graphql" && !c.path.includes("/ai/") && !c.path.startsWith("/oauth2"));
}

/** Connects through the real API so the page gets the sealed cookie. */
export async function connect(page: Page) {
  const r = await page.request.post("/api/v1/session", { headers: { "X-Tamely": "1" }, data: { token: GOOD_TOKEN } });
  expect(r.ok()).toBeTruthy();
}

/** Saves a named screenshot to artifacts/screens and attaches it to the report. */
export async function shot(page: Page, info: TestInfo, name: string) {
  fs.mkdirSync(SHOTS, { recursive: true });
  const file = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: file });
  await info.attach(name, { path: file, contentType: "image/png" });
}

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

/** Fails when visible text or controls are pushed past the right edge (clipped content). */
export async function nothingCutOff(page: Page) {
  const cut = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3,p,a,button,li")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.top < window.innerHeight * 3 && r.right > window.innerWidth + 1;
      })
      .map((el) => (el.textContent || "").trim().slice(0, 40)),
  );
  expect(cut).toEqual([]);
}

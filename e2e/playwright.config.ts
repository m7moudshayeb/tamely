import { defineConfig, devices } from "@playwright/test";

const PORT = 8788;
const MOCK = 8790;
export const BASE = `http://127.0.0.1:${PORT}`;

/** Runs the real Worker (wrangler dev) against a mock Cloudflare API. Artifacts land in e2e/artifacts. */
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  fullyParallel: false,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: "artifacts/test-output",
  reporter: [["list"], ["html", { outputFolder: "artifacts/report", open: "never" }], ["json", { outputFile: "artifacts/results.json" }]],
  use: {
    baseURL: BASE,
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : undefined,
  },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: [
    { command: `MOCK_PORT=${MOCK} node mock/server.mjs`, url: `http://127.0.0.1:${MOCK}/__calls`, reuseExistingServer: false },
    {
      command: `cd ../be && npx wrangler dev --port ${PORT} --ip 127.0.0.1 --var CF_API_BASE:http://127.0.0.1:${MOCK}/client/v4 --var SESSION_SECRET:e2e-only-secret-0123456789abcdefghijklmnop --var OAUTH_CLIENT_ID:e2e-client --var CF_OAUTH_BASE:http://127.0.0.1:${MOCK} --var DOCS_BASE:http://127.0.0.1:${MOCK}/docs`,
      url: `${BASE}/`,
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});

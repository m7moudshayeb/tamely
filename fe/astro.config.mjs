import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const SITE = process.env.PUBLIC_SITE_URL || "https://tamely.dev";

export default defineConfig({
  site: SITE,
  output: "static",
  trailingSlash: "ignore",
  /* Only Astro's own fingerprinted inline scripts may run; anything injected is blocked. */
  security: { csp: true },
  integrations: [react(), sitemap({ filter: (page) => !page.includes("/app") })],
  vite: {
    server: { proxy: { "/api": "http://127.0.0.1:8877" } },
  },
});

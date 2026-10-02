import { dashUrl, type CatalogPage } from "@tamely/shared/catalog";
import type { Guide } from "@tamely/shared/types";
import { GUIDE_RULES } from "../../shared/constants/guides";
import type { CfClient } from "../../shared/lib/cf-client";
import { SourceRegistry } from "../assistant/citations";
import { complete } from "../assistant/workers-ai";
import { readDocs } from "./docs";

/** One AI call on the person's own account: official docs in, short cited guide out. */
export async function buildGuide(opts: { cf: CfClient; accountId: string; models: string[]; page: CatalogPage; zoneName?: string; docsBase?: string }): Promise<Guide> {
  const { page } = opts;
  const docs = await readDocs(page.docs, opts.docsBase);
  const registry = new SourceRegistry();
  registry.add({ title: `${page.title}: Cloudflare docs`, href: page.docs, kind: "docs" });
  registry.add({ title: `${page.cfName} on Cloudflare`, href: dashUrl(page, opts.accountId, opts.zoneName), kind: "dashboard" });
  const ask = [
    `Topic: ${page.title}. Cloudflare's menu: ${page.cfName}. What it's for: ${page.summary}.`,
    `[S2] is this page on the Cloudflare dashboard.`,
    `[S1] Official docs:\n${docs}`,
  ].join("\n\n");
  const { content } = await complete(opts.cf, opts.accountId, opts.models, [{ role: "system", content: GUIDE_RULES }, { role: "user", content: ask }], []);
  const { text, citations } = registry.finalize(content);
  return { pageId: page.id, text, citations, generatedAt: new Date().toISOString() };
}

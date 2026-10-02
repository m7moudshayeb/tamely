import { dashUrl, findPage } from "@tamely/shared/catalog";
import type { Source } from "@tamely/shared/types";

/** Builds citations for a catalog page: in-app screen, Cloudflare dashboard, docs. */
export function pageSources(pageId: string, accountId: string, zoneName?: string, opts: { app?: boolean } = {}): Source[] {
  const page = findPage(pageId);
  if (!page) return [];
  const out: Source[] = [];
  if (opts.app !== false && page.appRoute) out.push({ title: `${page.title} in Tamely`, href: page.appRoute, kind: "app" });
  out.push({ title: `${page.cfName} on Cloudflare`, href: dashUrl(page, accountId, zoneName), kind: "dashboard" });
  out.push({ title: `${page.title}: Cloudflare docs`, href: page.docs, kind: "docs" });
  return out;
}

export const docsSource = (title: string, href: string): Source => ({ title, href, kind: "docs" });

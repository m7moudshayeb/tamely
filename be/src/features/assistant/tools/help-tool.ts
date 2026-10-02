import { dashUrl, searchCatalog } from "@tamely/shared/catalog";
import { GLOSSARY } from "@tamely/shared/glossary";
import type { Source } from "@tamely/shared/types";
import type { ToolDef } from "./types";

/** Finds the right Cloudflare page and docs for anything the app can't do itself. */
export const HELP_TOOL: ToolDef = {
  name: "find_help",
  description: "Search Cloudflare's features by plain words. Returns where it lives in the Cloudflare dashboard, official docs, and an in-app screen when one exists. Use it for how-to questions and before pointing anyone to Cloudflare.",
  parameters: { type: "object", properties: { query: { type: "string", description: "What the person wants to do, in plain words" } }, required: ["query"] },
  step: "Looking up the right place on Cloudflare",
  run: async (ctx, args) => {
    const q = String(args.query || "").slice(0, 200);
    const pages = searchCatalog(q, 4);
    const words = q.toLowerCase();
    const terms = GLOSSARY.filter((t) => words.includes(t.aka.toLowerCase().split(" ")[0]) || words.includes(t.term.toLowerCase())).slice(0, 2);
    const sources: Source[] = [];
    const data = pages.map((p) => {
      const dash = dashUrl(p, ctx.accountId, ctx.site?.name);
      sources.push({ title: `${p.cfName} on Cloudflare`, href: dash, kind: "dashboard" });
      sources.push({ title: `${p.title}: Cloudflare docs`, href: p.docs, kind: "docs" });
      if (p.appRoute) sources.push({ title: `${p.title} in Tamely`, href: p.appRoute, kind: "app" });
      return { plainName: p.title, cloudflareMenu: p.cfName, whatItDoes: p.summary, availableInTamely: !!p.appRoute };
    });
    for (const t of terms) sources.push({ title: `${t.aka}: Cloudflare docs`, href: t.docs, kind: "docs" });
    return { data: { pages: data, explanations: terms.map((t) => ({ term: t.aka, plain: t.plain, example: t.example })) }, sources };
  },
};

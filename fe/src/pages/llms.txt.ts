import type { APIRoute } from "astro";
import { CATALOG_GROUPS, CATALOG_PAGES } from "@tamely/shared/catalog";
import { FAQ, GLOSSARY } from "@tamely/shared/glossary";
import { SITE } from "@shared/constants/seo";

/** Plain-text summary for AI assistants and answer engines (llms.txt convention). */
export const GET: APIRoute = ({ site }) => {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "## Key facts",
    ...FAQ.map((f) => `- ${f.q} ${f.a}`),
    "",
    "## Pages",
    `- [Home](${new URL("/", site)}): what Tamely is and how to connect`,
    `- [Cloudflare terms in plain words](${new URL("/learn", site)}): glossary with examples`,
    "",
    "## Cloudflare terms",
    ...GLOSSARY.map((t) => `- ${t.aka} (${t.term}): ${t.plain} Docs: ${t.docs}`),
    "",
    "## Cloudflare dashboard, renamed in plain words",
    ...CATALOG_GROUPS.flatMap((g) => [
      `### ${g.title}`,
      ...CATALOG_PAGES.filter((p) => p.group === g.id).map((p) => `- ${p.title} (Cloudflare: ${p.cfName}): ${p.summary}. Docs: ${p.docs}`),
    ]),
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

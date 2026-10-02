/** Tiny, safe markdown subset: paragraphs, numbered/bulleted lists, **bold**, `code`, links, citation marks [n]. */
export type Inline =
  | { t: "text"; v: string }
  | { t: "bold"; v: Inline[] }
  | { t: "code"; v: string }
  | { t: "cite"; n: number }
  | { t: "link"; label: string; href: string };

export type Block = { t: "p"; v: Inline[] } | { t: "ol"; items: Inline[][] } | { t: "ul"; items: Inline[][] };

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\[\d{1,3}\])/g;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  for (const part of s.split(INLINE)) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**")) out.push({ t: "bold", v: parseInline(part.slice(2, -2)) });
    else if (part.startsWith("`") && part.endsWith("`")) out.push({ t: "code", v: part.slice(1, -1) });
    else if (/^\[\d{1,3}\]$/.test(part)) out.push({ t: "cite", n: Number(part.slice(1, -1)) });
    else {
      const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      out.push(m ? { t: "link", label: m[1], href: m[2] } : { t: "text", v: part });
    }
  }
  return out;
}

export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of text.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) blocks.push({ t: "ol", items: lines.map((l) => parseInline(l.replace(/^\s*\d+[.)]\s+/, ""))) });
    else if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) blocks.push({ t: "ul", items: lines.map((l) => parseInline(l.replace(/^\s*[-*•]\s+/, ""))) });
    else {
      // A paragraph followed by a list in the same chunk
      const firstList = lines.findIndex((l) => /^\s*(\d+[.)]|[-*•])\s+/.test(l));
      if (firstList > 0) {
        blocks.push({ t: "p", v: parseInline(lines.slice(0, firstList).join(" ")) });
        blocks.push(...parseBlocks(lines.slice(firstList).join("\n")));
      } else blocks.push({ t: "p", v: parseInline(lines.join(" ")) });
    }
  }
  return blocks;
}

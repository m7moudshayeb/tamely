import type { Citation, Source } from "@tamely/shared/types";

/** Collects sources seen during a chat and turns [S#] marks into numbered citations. */
export class SourceRegistry {
  private list: Source[] = [];

  add(source: Source): string {
    let i = this.list.findIndex((s) => s.href === source.href);
    if (i < 0) i = this.list.push(source) - 1;
    return `S${i + 1}`;
  }

  /** Text block the model sees under each tool result. */
  label(sources: Source[]): string {
    if (!sources.length) return "";
    return "\nSources you may cite:\n" + sources.map((s) => `[${this.add(s)}] ${s.title}`).join("\n");
  }

  has(href: string): boolean {
    return this.list.some((s) => s.href === href);
  }

  get size(): number {
    return this.list.length;
  }

  /** Renumbers cited sources by first appearance; drops marks that don't exist. */
  finalize(text: string): { text: string; citations: Citation[] } {
    const map = new Map<number, number>();
    const citations: Citation[] = [];
    const out = text.replace(/\[\s*S?(\d{1,3})\s*\]/gi, (_m, d: string) => {
      const idx = Number(d) - 1;
      const src = this.list[idx];
      if (!src) return "";
      if (!map.has(idx)) {
        map.set(idx, citations.length + 1);
        citations.push({ ...src, n: citations.length + 1 });
      }
      return `[${map.get(idx)}]`;
    });
    return { text: this.stripUnknownLinks(out).replace(/[ \t]+([.,;:!?])/g, "$1").replace(/[ \t]+\n/g, "\n").trim(), citations };
  }

  /** Markdown links to places we never looked up are turned into plain text. */
  private stripUnknownLinks(text: string): string {
    return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, href: string) =>
      this.has(href) || href.startsWith("/app") ? m : label,
    );
  }

  /** Fallback when the model cited nothing: list what it looked at. */
  all(): Citation[] {
    return this.list.map((s, i) => ({ ...s, n: i + 1 }));
  }
}

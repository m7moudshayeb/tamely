import { useCallback, useEffect, useState } from "react";
import { rankCatalog, type CatalogPage } from "@tamely/shared/catalog";

const MAX = 6;
/** A match must be this good on its own, and close to the best one. */
const MIN_SCORE = 2;
const NEAR_TOP = 0.4;

export interface PageFind {
  query: string;
  pages: CatalogPage[];
}

const rowFor = (id: string) => document.querySelector<HTMLElement>(`[data-page-id="${CSS.escape(id)}"]`);

/** Answers a question by pointing at the right topics on this page. Returns false when nothing fits. */
export function useFindOnPage() {
  const [find, setFind] = useState<PageFind | null>(null);
  const clear = useCallback(() => setFind(null), []);

  const run = useCallback((text: string) => {
    const ranked = rankCatalog(text);
    const top = ranked[0]?.score || 0;
    if (top < MIN_SCORE) return false;
    const pages = ranked.filter((r) => r.score >= Math.max(MIN_SCORE, top * NEAR_TOP)).slice(0, MAX).map((r) => r.page);
    setFind({ query: text.trim(), pages });
    return true;
  }, []);

  const reveal = useCallback((id: string) => {
    const row = rowFor(id);
    if (!row) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
    row.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
  }, []);

  /* Bring the best match into view; Escape clears. */
  useEffect(() => {
    if (!find) return;
    const t = window.setTimeout(() => reveal(find.pages[0].id), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && clear();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [find, reveal, clear]);

  return { find, run, clear, reveal, matched: find ? new Set(find.pages.map((p) => p.id)) : null };
}

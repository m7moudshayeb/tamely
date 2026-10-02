import { CATALOG_GROUPS } from "./groups";
import { CATALOG_PAGES } from "./pages";
import type { CatalogPage } from "./types";

export * from "./types";
export { CATALOG_GROUPS, CATALOG_PAGES };

export const DASH_ROOT = "https://dash.cloudflare.com";

/** Deep link into the Cloudflare dashboard for a page. Falls back to the account when no site is known. */
export function dashUrl(page: Pick<CatalogPage, "scope" | "path">, accountId?: string, zoneName?: string): string {
  if (!accountId) return DASH_ROOT;
  if (page.scope === "zone") {
    return zoneName ? `${DASH_ROOT}/${accountId}/${zoneName}${page.path}` : `${DASH_ROOT}/${accountId}/domains/overview`;
  }
  return `${DASH_ROOT}/${accountId}${page.path}`;
}

export const findPage = (id: string): CatalogPage | undefined => CATALOG_PAGES.find((p) => p.id === id);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9@ ]+/g, " ").replace(/\s+/g, " ").trim();

/** Words that carry no meaning in a question ("how do I…", "my site"). */
const STOP = new Set("a an and are as at be by can could do does for from get have here how i i'm im in into is it its me my of on or our please site so that the their them there these this to us want we what whats when where which who why will with would you your website page pages".split(" "));
/** Everyday words → the words the catalog uses. */
const SYNONYMS: Record<string, string> = {
  faster: "speed", fast: "speed", slow: "speed", quick: "speed", load: "speed",
  photo: "image", picture: "image", pic: "image", hack: "attack", hacker: "attack",
  mail: "email", inbox: "email", down: "uptime", offline: "uptime", online: "uptime",
};
/** "emails" → "email", "blocking" → "block": enough for short feature names. */
const stem = (w: string) => w.replace(/(ing|es|s)$/, (m) => (w.length - m.length >= 3 ? "" : m));
const words = (s: string) => norm(s).split(" ").filter(Boolean).map(stem);

/** Ranked matches with scores. Whole-word matches only, so "on" never hits "domain". */
export function rankCatalog(query: string): { page: CatalogPage; score: number }[] {
  const base = norm(query).split(" ").filter((w) => w.length > 1 && !STOP.has(w)).map(stem);
  const q = [...new Set([...base, ...base.flatMap((w) => (SYNONYMS[w] ? [SYNONYMS[w]] : []))])];
  if (!q.length) return [];
  return CATALOG_PAGES.map((page) => {
    const kw = new Set(words((page.keywords || []).join(" ")));
    const title = new Set(words(page.title));
    const rest = new Set(words([page.cfName, page.summary].join(" ")));
    let score = 0;
    for (const w of q) score += (kw.has(w) ? 3 : 0) + (title.has(w) ? 2 : 0) + (rest.has(w) ? 1 : 0);
    return { page, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Small keyword search used by the explorer and the assistant's help tool. */
export function searchCatalog(query: string, limit = 6): CatalogPage[] {
  return rankCatalog(query).slice(0, limit).map((x) => x.page);
}

/** Deep link to one deployed app (Worker) on the dashboard. */
export const workerUrl = (accountId: string, name: string): string =>
  `${DASH_ROOT}/${accountId}/workers/services/view/${encodeURIComponent(name)}/production`;

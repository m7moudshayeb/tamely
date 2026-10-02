import { CATALOG_PAGES, findPage, searchCatalog } from "../catalog";
import { APP_ROUTES } from "../routes";

/** Built-in sidebar links. Fixed ones always stay, so there's a way back to everything. */
export interface SidebarItem {
  path: string;
  label: string;
  fixed?: boolean;
  /** Other words people use for it, for the assistant. */
  aka: string[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { path: APP_ROUTES.home, label: "Ask & briefing", fixed: true, aka: ["home", "chat", "briefing", "ask"] },
  { path: APP_ROUTES.visitors, label: "Visitors", aka: ["visitors", "analytics", "web analytics", "traffic", "stats", "statistics"] },
  { path: APP_ROUTES.address, label: "Your address", aka: ["address", "dns", "domain", "domains", "records"] },
  { path: APP_ROUTES.protection, label: "Protection", aka: ["protection", "security", "ssl", "firewall", "padlock"] },
  { path: APP_ROUTES.speed, label: "Speed", aka: ["speed", "cache", "caching", "performance"] },
  { path: APP_ROUTES.email, label: "Email", aka: ["email", "emails", "mail", "email routing", "email forwarding"] },
  { path: APP_ROUTES.redirects, label: "Redirects", aka: ["redirects", "redirect", "links", "rules"] },
  { path: APP_ROUTES.apps, label: "Apps", aka: ["apps", "workers", "pages", "workers & pages"] },
  { path: APP_ROUTES.explore, label: "Everything else", fixed: true, aka: ["everything else", "explore"] },
  { path: APP_ROUTES.setup, label: "Setup & help", fixed: true, aka: ["setup", "help", "setup & help"] },
];

/** A built-in link (by path) or a Cloudflare page (by catalog id). */
export type SidebarRef = { kind: "nav"; path: string } | { kind: "page"; id: string };

export interface SidebarChange {
  id: string;
  add: SidebarRef[];
  remove: SidebarRef[];
}

export const PINNABLE_PAGE_IDS = new Set(CATALOG_PAGES.filter((p) => !p.appRoute).map((p) => p.id));
export const navItem = (path: string) => SIDEBAR_ITEMS.find((i) => i.path === path);
export const sidebarLabel = (r: SidebarRef) => (r.kind === "nav" ? navItem(r.path)?.label : findPage(r.id)?.title) || "";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9& ]+/g, " ").replace(/\s+/g, " ").trim();

/** Exact title, id or Cloudflare menu name ("R2") beats keyword search. */
function exactPage(q: string) {
  const exact = CATALOG_PAGES.find((p) => p.id === q || norm(p.title) === q || norm(p.cfName) === q);
  if (exact) return exact;
  const prefixed = CATALOG_PAGES.filter((p) => norm(p.cfName).startsWith(q + " "));
  return prefixed.length === 1 ? prefixed[0] : undefined;
}

/** Turns a plain name ("emails", "Web Analytics") into a sidebar link, or null if nothing fits. */
export function resolveSidebarName(name: string): { ref: SidebarRef; label: string; fixed: boolean } | null {
  const q = norm(name);
  if (!q) return null;
  const nav = SIDEBAR_ITEMS.find((i) => norm(i.label) === q || i.aka.includes(q));
  if (nav) return { ref: { kind: "nav", path: nav.path }, label: nav.label, fixed: !!nav.fixed };
  const page = exactPage(q) || searchCatalog(q, 1)[0];
  if (!page) return null;
  const owner = page.appRoute ? navItem(page.appRoute) : undefined;
  if (owner) return { ref: { kind: "nav", path: owner.path }, label: owner.label, fixed: !!owner.fixed };
  return { ref: { kind: "page", id: page.id }, label: page.title, fixed: false };
}

/** Topics that have their own Tamely screen, so Everything else can put that screen back in the sidebar. */
export const GROUP_HOME: Record<string, string> = {
  insights: APP_ROUTES.visitors,
  address: APP_ROUTES.address,
  protection: APP_ROUTES.protection,
  speed: APP_ROUTES.speed,
  email: APP_ROUTES.email,
  links: APP_ROUTES.redirects,
  apps: APP_ROUTES.apps,
};

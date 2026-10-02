import { PINNABLE_PAGE_IDS } from "@tamely/shared/sidebar";
import { STORAGE_KEYS } from "@shared/constants/storage";
import { MAX_PINS, NAV_ALL } from "../constants/nav";

/** Hidden built-in items (by path), pinned Cloudflare pages (by catalog id), and the order people chose. */
export interface SidebarLayout {
  hidden: string[];
  pins: string[];
  /** Keys like "nav:/app/speed" or "page:containers"; anything missing keeps its default place. */
  order: string[];
}

const EMPTY: SidebarLayout = { hidden: [], pins: [], order: [] };
export const navKey = (path: string) => `nav:${path}`;
export const pageKey = (id: string) => `page:${id}`;
const navPaths = new Set(NAV_ALL.filter((n) => !n.fixed).map((n) => n.path));
const orderKeys = new Set([...NAV_ALL.map((n) => navKey(n.path)), ...[...PINNABLE_PAGE_IDS].map(pageKey)]);
const listeners = new Set<() => void>();
let current: SidebarLayout | null = null;

/** Stored data is untrusted: keep only known ids, no duplicates, within limits. */
function clean(raw: unknown): SidebarLayout {
  const v = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof SidebarLayout, unknown>>;
  const list = (x: unknown, ok: ReadonlySet<string>) => (Array.isArray(x) ? [...new Set(x.filter((i): i is string => typeof i === "string" && ok.has(i)))] : []);
  return { hidden: list(v.hidden, navPaths), pins: list(v.pins, PINNABLE_PAGE_IDS).slice(0, MAX_PINS), order: list(v.order, orderKeys) };
}

function read(): SidebarLayout {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.sidebar);
    return raw ? clean(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const sidebarStore = {
  get(): SidebarLayout {
    if (typeof window === "undefined") return EMPTY;
    return (current ??= read());
  },
  getServer: (): SidebarLayout => EMPTY,
  set(next: SidebarLayout) {
    current = clean(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.sidebar, JSON.stringify(current));
    } catch {
      /* Private mode or storage off: the change still applies until the page reloads. */
    }
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    /* Keep other open tabs in step. */
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEYS.sidebar) return;
      current = read();
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};

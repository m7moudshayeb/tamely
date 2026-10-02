import { useSyncExternalStore } from "react";
import type { CatalogPage } from "@tamely/shared/catalog";
import type { SidebarChange, SidebarRef } from "@tamely/shared/sidebar";
import { MAX_PINS, NAV_ALL, type NavItem } from "../constants/nav";
import { navKey, sidebarStore } from "./sidebarStore";

/** A page Tamely already has a screen for maps to that sidebar item instead of a new shortcut. */
const navFor = (p: CatalogPage): NavItem | undefined => (p.appRoute ? NAV_ALL.find((n) => n.path === p.appRoute) : undefined);

/** Which links the sidebar shows. Saved in this browser only; nothing goes to our servers. */
export function useSidebarLayout() {
  const layout = useSyncExternalStore(sidebarStore.subscribe, sidebarStore.get, sidebarStore.getServer);
  const set = sidebarStore.set;

  const showsNav = (n: NavItem) => !!n.fixed || !layout.hidden.includes(n.path);
  const inSidebar = (p: CatalogPage) => {
    const nav = navFor(p);
    return nav ? showsNav(nav) : layout.pins.includes(p.id);
  };
  /** Name shown in the sidebar for this page, and whether it can be added or removed at all. */
  const target = (p: CatalogPage) => {
    const nav = navFor(p);
    return { label: nav?.label || p.title, locked: !!nav?.fixed };
  };
  const full = layout.pins.length >= MAX_PINS;

  const toggle = (p: CatalogPage): "added" | "removed" | "full" | "locked" => {
    const nav = navFor(p);
    if (nav?.fixed) return "locked";
    if (nav) {
      const hidden = layout.hidden.includes(nav.path);
      set({ ...layout, hidden: hidden ? layout.hidden.filter((x) => x !== nav.path) : [...layout.hidden, nav.path] });
      return hidden ? "added" : "removed";
    }
    if (layout.pins.includes(p.id)) {
      set({ ...layout, pins: layout.pins.filter((x) => x !== p.id) });
      return "removed";
    }
    if (full) return "full";
    set({ ...layout, pins: [...layout.pins, p.id] });
    return "added";
  };

  /** True when the sidebar already shows (or already lacks) this link. */
  const has = (r: SidebarRef) => (r.kind === "nav" ? !!NAV_ALL.find((n) => n.path === r.path)?.fixed || !layout.hidden.includes(r.path) : layout.pins.includes(r.id));
  const apply = (c: SidebarChange) => {
    const navOut = c.remove.flatMap((r) => (r.kind === "nav" ? [r.path] : []));
    const navIn = c.add.flatMap((r) => (r.kind === "nav" ? [r.path] : []));
    const pinOut = c.remove.flatMap((r) => (r.kind === "page" ? [r.id] : []));
    const pinIn = c.add.flatMap((r) => (r.kind === "page" ? [r.id] : []));
    set({
      ...layout,
      hidden: [...layout.hidden.filter((p) => !navIn.includes(p)), ...navOut],
      pins: [...layout.pins.filter((id) => !pinOut.includes(id)), ...pinIn.filter((id) => !layout.pins.includes(id))],
    });
  };

  return {
    layout,
    has,
    apply,
    restore: set,
    showsNav,
    inSidebar,
    target,
    toggle,
    /** Sorts one section by the saved order; unsorted items keep their default place after. */
    sorted: <T,>(items: T[], key: (item: T) => string) => {
      const at = (k: string) => {
        const i = layout.order.indexOf(k);
        return i < 0 ? Number.MAX_SAFE_INTEGER : i;
      };
      return items.map((item, i) => ({ item, i })).sort((a, b) => at(key(a.item)) - at(key(b.item)) || a.i - b.i).map((x) => x.item);
    },
    /** Saves a section's new order without touching other sections. */
    reorder: (keys: string[]) => set({ ...layout, order: [...layout.order.filter((k) => !keys.includes(k)), ...keys] }),
    navKey,
    showNav: (path: string) => set({ ...layout, hidden: layout.hidden.filter((x) => x !== path) }),
    hideNav: (path: string) => set({ ...layout, hidden: [...layout.hidden, path] }),
    unpin: (id: string) => set({ ...layout, pins: layout.pins.filter((x) => x !== id) }),
    reset: () => set({ hidden: [], pins: [], order: [] }),
    customized: layout.hidden.length > 0 || layout.pins.length > 0 || layout.order.length > 0,
  };
}

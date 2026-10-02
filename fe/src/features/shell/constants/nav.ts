import { APP_ROUTES } from "@tamely/shared/routes";
import { navItem } from "@tamely/shared/sidebar";
import type { IconName, TileColor } from "@ui";

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  color: TileColor;
  /** Always shown, so there's a way back to everything. */
  fixed?: boolean;
}

/** Labels and "fixed" come from the shared list the assistant also uses. */
const item = (path: string, icon: IconName, color: TileColor): NavItem => {
  const base = navItem(path);
  return { path, label: base?.label || path, fixed: base?.fixed, icon, color };
};

export const NAV_MAIN: NavItem[] = [item(APP_ROUTES.home, "bubble", "brand"), item(APP_ROUTES.visitors, "chart", "blue")];

export const NAV_SITE: NavItem[] = [
  item(APP_ROUTES.address, "globe", "teal"),
  item(APP_ROUTES.protection, "shield", "green"),
  item(APP_ROUTES.speed, "bolt", "yellow"),
  item(APP_ROUTES.email, "envelope", "blue"),
  item(APP_ROUTES.redirects, "signpost", "purple"),
];

export const NAV_MORE: NavItem[] = [item(APP_ROUTES.apps, "cube", "pink"), item(APP_ROUTES.explore, "compass", "graphite"), item(APP_ROUTES.setup, "question", "graphite")];

export const NAV_ALL: NavItem[] = [...NAV_MAIN, ...NAV_SITE, ...NAV_MORE];
/** Most shortcuts a person can pin, so the sidebar stays usable. */
export const MAX_PINS = 12;

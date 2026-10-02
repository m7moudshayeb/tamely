import { useState } from "react";
import { findPage, type CatalogPage } from "@tamely/shared/catalog";
import { Logo, type SortableItem } from "@ui";
import { NAV_MAIN, NAV_MORE, NAV_SITE, type NavItem } from "../constants/nav";
import { pageKey } from "../hooks/sidebarStore";
import { useSidebarLayout } from "../hooks/useSidebarLayout";
import { AccountMenu } from "./AccountMenu";
import { EditSidebar } from "./EditSidebar";
import { EmptyShortcuts } from "./EmptyShortcuts";
import { NavLinkRow } from "./NavLinkRow";
import { ShortcutRow } from "./ShortcutRow";
import styles from "./Sidebar.module.css";
import { SidebarSection } from "./SidebarSection";
import { SiteSwitcher } from "./SiteSwitcher";

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const sidebar = useSidebarLayout();
  const [editing, setEditing] = useState(false);
  const pinned = sidebar.layout.pins.map(findPage).filter((p): p is CatalogPage => !!p);
  const pinRow = (p: CatalogPage): SortableItem => ({
    id: pageKey(p.id),
    label: p.title,
    node: <ShortcutRow page={p} onNavigate={onNavigate} onRemove={editing ? () => sidebar.unpin(p.id) : undefined} />,
  });
  const navRow = (i: NavItem): SortableItem => ({
    id: sidebar.navKey(i.path),
    label: i.label,
    node: <NavLinkRow item={i} onNavigate={onNavigate} onRemove={editing && !i.fixed ? () => sidebar.hideNav(i.path) : undefined} />,
  });
  /* Built-in screens stay in their own section; pages added from Everything else live in Your shortcuts. */
  const items = (nav: NavItem[]) => sidebar.sorted(nav.filter(sidebar.showsNav).map(navRow), (i) => i.id);
  const shortcuts = sidebar.sorted(pinned.map(pinRow), (i) => i.id);
  const section = (title: string | undefined, list: SortableItem[]) => <SidebarSection title={title} items={list} editing={editing} onReorder={sidebar.reorder} />;

  return (
    <aside className={[styles.sidebar, open ? styles.open : "", editing ? styles.editing : ""].join(" ")} aria-label="Main menu">
      <a href="/" className={styles.brand}><Logo size={22} /></a>
      <SiteSwitcher />
      <nav className={styles.nav}>
        {section(undefined, items(NAV_MAIN))}
        {section("This website", items(NAV_SITE))}
        <SidebarSection title="Your shortcuts" items={shortcuts} editing={editing} onReorder={sidebar.reorder} empty={<EmptyShortcuts onNavigate={onNavigate} />} />
        {section("More", items(NAV_MORE))}
        <EditSidebar editing={editing} customized={sidebar.customized} onEdit={() => setEditing(true)} onDone={() => setEditing(false)} onReset={sidebar.reset} />
      </nav>
      <AccountMenu />
    </aside>
  );
}

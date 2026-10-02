import { Link, useLocation } from "wouter";
import { IconTile } from "@ui";
import type { NavItem } from "../constants/nav";
import { RemoveButton } from "./RemoveButton";
import styles from "./Sidebar.module.css";

/** Paths are absolute (/app/...); wouter's base is not used so links stay real URLs. */
export function NavLinkRow({ item, onNavigate, onRemove }: { item: NavItem; onNavigate?: () => void; onRemove?: () => void }) {
  const [loc] = useLocation();
  const active = item.path === "/app" ? loc === "/app" || loc === "/app/" : loc.startsWith(item.path);
  return (
    <div className={styles.row}>
      <Link href={item.path} className={[styles.link, active ? styles.active : ""].join(" ")} aria-current={active ? "page" : undefined} onClick={onNavigate}>
        <IconTile icon={item.icon} color={item.color} size={18} />
        <span>{item.label}</span>
      </Link>
      {onRemove && <RemoveButton label={item.label} onRemove={onRemove} />}
    </div>
  );
}

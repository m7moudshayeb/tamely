import { Link, useLocation } from "wouter";
import type { CatalogPage } from "@tamely/shared/catalog";
import { guidePath } from "@tamely/shared/routes";
import { GROUP_ART, pageIcon } from "@features/explore/art";
import { IconTile } from "@ui";
import { RemoveButton } from "./RemoveButton";
import styles from "./Sidebar.module.css";

/** A Cloudflare page the person added. It opens a plain guide in Tamely, with a way out to Cloudflare. */
export function ShortcutRow({ page, onNavigate, onRemove }: { page: CatalogPage; onNavigate?: () => void; onRemove?: () => void }) {
  const [loc] = useLocation();
  const href = guidePath(page.id);
  const active = loc === href;
  return (
    <div className={styles.row}>
      <Link href={href} className={[styles.link, active ? styles.active : ""].join(" ")} aria-current={active ? "page" : undefined} onClick={onNavigate}>
        <IconTile icon={pageIcon(page)} color={GROUP_ART[page.group]?.color || "graphite"} size={18} />
        <span>{page.title}</span>
      </Link>
      {onRemove && <RemoveButton label={page.title} onRemove={onRemove} />}
    </div>
  );
}

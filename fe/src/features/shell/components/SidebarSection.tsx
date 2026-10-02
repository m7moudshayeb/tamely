import type { ReactNode } from "react";
import { SortableList, SortableSpacerRow, type SortableItem } from "@ui";
import styles from "./Sidebar.module.css";

/** One group of sidebar links: plain while browsing, reorderable by its handles while editing. */
export function SidebarSection({ title, items, editing, onReorder, empty }: { title?: string; items: SortableItem[]; editing: boolean; onReorder: (ids: string[]) => void; empty?: ReactNode }) {
  if (!items.length && !empty) return null;
  if (!items.length) {
    return (
      <>
        {title && <p className={styles.heading}>{title}</p>}
        {empty}
      </>
    );
  }
  const body = !editing ? (
    <div className={styles.section}>{items.map((i) => <div key={i.id}>{i.node}</div>)}</div>
  ) : items.length > 1 ? (
    <SortableList label={title || "the top links"} items={items} onReorder={onReorder} />
  ) : (
    <div className={styles.section}>{items.map((i) => <SortableSpacerRow key={i.id}>{i.node}</SortableSpacerRow>)}</div>
  );
  return (
    <>
      {title && <p className={styles.heading}>{title}</p>}
      {body}
    </>
  );
}

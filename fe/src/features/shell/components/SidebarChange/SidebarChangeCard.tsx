import { useState } from "react";
import { sidebarLabel, type SidebarChange, type SidebarRef } from "@tamely/shared/sidebar";
import { Button, Icon } from "@ui";
import { useSidebarLayout } from "../../hooks/useSidebarLayout";
import type { SidebarLayout } from "../../hooks/sidebarStore";
import styles from "./SidebarChangeCard.module.css";

/** The assistant's sidebar change. Applied in this browser only after Confirm. */
export function SidebarChangeCard({ change }: { change: SidebarChange }) {
  const sidebar = useSidebarLayout();
  const [before, setBefore] = useState<SidebarLayout | null>(null);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const done = !!before;
  const line = (r: SidebarRef, adding: boolean) => {
    const already = !done && sidebar.has(r) === adding;
    return (
      <li key={`${adding}-${r.kind === "nav" ? r.path : r.id}`} className={adding ? styles.add : styles.remove}>
        <Icon name={adding ? "plusCircle" : "xmarkCircle"} size={15} />
        <span>{adding ? "Add" : "Remove"} <b>{sidebarLabel(r)}</b>{already && <em> (already {adding ? "there" : "gone"})</em>}</span>
      </li>
    );
  };
  const confirm = () => {
    setBefore(sidebar.layout);
    sidebar.apply(change);
  };

  return (
    <div className={[styles.card, done ? styles.done : ""].join(" ")} data-testid="sidebar-change">
      <span className={styles.icon}><Icon name={done ? "checkCircle" : "sidebar"} size={15} /></span>
      <div className={styles.body}>
        <b>{done ? "Your sidebar is updated." : "Update your sidebar"}</b>
        <ul>{[...change.remove.map((r) => line(r, false)), ...change.add.map((r) => line(r, true))]}</ul>
        <p>Saved in this browser only. Removed links stay in Everything else.</p>
      </div>
      <div className={styles.actions}>
        {done ? (
          <Button size="sm" variant="gray" icon="arrowClockwise" onClick={() => { sidebar.restore(before); setBefore(null); }}>Undo</Button>
        ) : (
          <>
            <Button size="sm" variant="gray" onClick={() => setDismissed(true)}>Not now</Button>
            <Button size="sm" onClick={confirm}>Confirm</Button>
          </>
        )}
      </div>
    </div>
  );
}

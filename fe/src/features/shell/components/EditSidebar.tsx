import { Link } from "wouter";
import { APP_ROUTES } from "@tamely/shared/routes";
import { Button } from "@ui";
import styles from "./Sidebar.module.css";

/** The switch between using the sidebar and changing what's in it. */
export function EditSidebar({ editing, customized, onEdit, onDone, onReset }: { editing: boolean; customized: boolean; onEdit: () => void; onDone: () => void; onReset: () => void }) {
  if (!editing) {
    return <Button className={styles.editBtn} size="sm" variant="plain" icon="sidebar" onClick={onEdit}>Edit sidebar</Button>;
  }
  return (
    <div className={styles.editPanel} role="group" aria-label="Edit sidebar">
      <p>Drag the dots to reorder. Tap × to remove. Add more from <Link href={APP_ROUTES.explore} onClick={onDone}>Everything else</Link>.</p>
      <div className={styles.editActions}>
        {customized && <Button size="sm" variant="plain" onClick={onReset}>Reset</Button>}
        <Button size="sm" variant="ink" onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

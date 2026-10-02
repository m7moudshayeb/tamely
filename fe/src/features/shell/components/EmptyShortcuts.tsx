import { Link } from "wouter";
import { APP_ROUTES } from "@tamely/shared/routes";
import { Icon } from "@ui";
import styles from "./Sidebar.module.css";

/** Keeps Your shortcuts visible when empty, with the way to fill it. */
export function EmptyShortcuts({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href={APP_ROUTES.explore} className={styles.emptyShortcut} onClick={onNavigate}>
      <Icon name="plusCircle" size={14} />
      <span>Add from Everything else</span>
    </Link>
  );
}

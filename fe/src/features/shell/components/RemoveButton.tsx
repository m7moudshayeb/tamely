import { IconButton } from "@ui";
import styles from "./Sidebar.module.css";

/** Shown next to a sidebar link while editing. */
export function RemoveButton({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <IconButton className={styles.remove} icon="xmarkCircle" label={`Remove ${label} from the sidebar`} size={24} iconSize={16} onClick={onRemove} />;
}

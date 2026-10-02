import { Spinner } from "@ui";
import styles from "./WorkingIndicator.module.css";

/** Shown whenever the assistant is busy but no step is visibly running (e.g. writing the answer). */
export function WorkingIndicator({ label }: { label: string }) {
  return (
    <p className={styles.working} role="status" aria-live="polite">
      <Spinner size={12} />
      <span className={styles.shimmer}>{label}</span>
    </p>
  );
}

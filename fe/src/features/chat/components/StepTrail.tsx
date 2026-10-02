import type { ChatStep } from "@tamely/shared/types";
import { Icon, Spinner } from "@ui";
import styles from "./StepTrail.module.css";

/** What the assistant did, step by step, as it happens. */
export function StepTrail({ steps }: { steps: ChatStep[] }) {
  if (!steps.length) return null;
  return (
    <ol className={styles.trail} aria-label="What the assistant did">
      {steps.map((s) => (
        <li key={s.id} className={styles[s.status]}>
          <span className={styles.mark}>
            {s.status === "running" ? <Spinner size={13} /> : <Icon name={s.status === "done" ? "checkCircle" : "xmarkCircle"} size={16} />}
          </span>
          <span>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

import type { SetupCheck } from "@tamely/shared/types";
import { ExternalLink, Icon, Skeleton } from "@ui";
import styles from "./ChecksList.module.css";

/** What works with this token, and a fix link for anything that doesn't. */
export function ChecksList({ checks, loading }: { checks?: SetupCheck[]; loading: boolean }) {
  if (loading || !checks) {
    return (
      <ul className={styles.list} aria-busy>
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className={styles.row}><Skeleton width={22} height={22} radius={11} /><Skeleton width="60%" /></li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={styles.list} aria-label="Setup check">
      {checks.map((c) => (
        <li key={c.id} className={styles.row} data-ok={c.ok}>
          <span className={c.ok ? styles.ok : styles.bad}>
            <Icon name={c.ok ? "checkCircle" : "exclamation"} size={16} label={c.ok ? "Works" : "Needs a fix"} />
          </span>
          <span className={styles.text}>
            <b>{c.label}</b>
            <span>{c.detail}</span>
            {c.fix && <ExternalLink href={c.fix.href}>{c.fix.label}</ExternalLink>}
          </span>
        </li>
      ))}
    </ul>
  );
}

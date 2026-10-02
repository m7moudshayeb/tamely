import styles from "./BarList.module.css";

export interface BarItem {
  key: string;
  label: string;
  value: number;
  display: string;
}

/** Ranked horizontal bars with direct labels; better than a pie for many categories. */
export function BarList({ items, label }: { items: BarItem[]; label: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((i) => (
        <li key={i.key} className={styles.row}>
          <span className={styles.bar} style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }} />
          <span className={styles.label}>{i.label}</span>
          <span className={styles.value}>{i.display}</span>
        </li>
      ))}
    </ul>
  );
}

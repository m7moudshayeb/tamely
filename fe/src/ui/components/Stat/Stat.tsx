import { Icon } from "../../icons";
import styles from "./Stat.module.css";

export interface StatProps {
  label: string;
  value: string;
  change?: number | null;
  /** When true, a rise is bad (e.g. errors) */
  invert?: boolean;
  hint?: string;
  size?: "md" | "sm";
}

export function Stat({ label, value, change, invert, hint, size = "md" }: StatProps) {
  const up = (change ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <div className={[styles.stat, size === "sm" ? styles.sm : ""].join(" ")}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {change !== undefined && change !== null ? (
        <span className={[styles.change, good ? styles.good : styles.bad].join(" ")}>
          <Icon name="arrowUp" size={12} weight={2.6} style={{ transform: up ? undefined : "rotate(180deg)" }} />
          {Math.abs(change)}% <span className={styles.vs}>vs before</span>
        </span>
      ) : hint ? (
        <span className={styles.vs}>{hint}</span>
      ) : null}
    </div>
  );
}

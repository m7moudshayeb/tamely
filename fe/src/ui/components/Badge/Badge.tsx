import type { ReactNode } from "react";
import { Icon, type IconName } from "../../icons";
import styles from "./Badge.module.css";

export type Tone = "good" | "attention" | "info" | "danger" | "neutral" | "accent";

export function Badge({ tone = "neutral", icon, children }: { tone?: Tone; icon?: IconName; children: ReactNode }) {
  return (
    <span className={[styles.badge, styles[tone]].join(" ")}>
      {icon && <Icon name={icon} size={11} weight={2.2} />}
      {children}
    </span>
  );
}

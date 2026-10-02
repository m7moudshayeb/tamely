import type { ReactNode } from "react";
import { Icon, type IconName } from "../../icons";
import styles from "./EmptyState.module.css";

export function EmptyState({ icon, title, children, action }: { icon: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}><Icon name={icon} size={20} /></span>
      <h3 className={styles.title}>{title}</h3>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  );
}

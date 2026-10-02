import type { ReactNode } from "react";
import styles from "./Group.module.css";

/** Inset grouped list (iOS Settings style) with an optional header and footer. */
export function Group({ title, footer, action, children }: { title?: ReactNode; footer?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.group}>
      {(title || action) && (
        <header className={styles.head}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {action}
        </header>
      )}
      <div className={styles.body}>{children}</div>
      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  );
}

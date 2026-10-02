import type { ReactNode } from "react";
import { Icon } from "../../icons";
import styles from "./ExternalLink.module.css";

/** Opens outside the app in a new tab with an arrow hint. */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <Icon name="arrowUpRight" size={13} weight={2.2} />
    </a>
  );
}

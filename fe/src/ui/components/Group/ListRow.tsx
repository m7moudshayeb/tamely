import type { ReactNode } from "react";
import { Icon } from "../../icons";
import styles from "./Group.module.css";

export interface ListRowProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  chevron?: boolean;
}

export function ListRow({ leading, title, subtitle, trailing, href, external, onClick, chevron }: ListRowProps) {
  const body = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.main}>
        <span className={styles.rowTitle}>{title}</span>
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
      {(chevron || href) && <Icon name={external ? "arrowUpRight" : "chevronRight"} size={15} weight={2.2} className={styles.chev} />}
    </>
  );
  if (href) {
    return (
      <a className={[styles.row, styles.interactive].join(" ")} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={[styles.row, styles.interactive].join(" ")} onClick={onClick}>
        {body}
      </button>
    );
  }
  return <div className={styles.row}>{body}</div>;
}

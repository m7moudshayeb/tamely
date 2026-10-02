import type { Citation } from "@tamely/shared/types";
import { Link } from "wouter";
import { Icon } from "@ui";
import styles from "./Citations.module.css";
import { KIND } from "./kinds";

export function SourceList({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <div className={styles.sources}>
      <p className={styles.heading}>Sources</p>
      <ol className={styles.list}>
        {citations.map((c) => {
          const inner = (
            <>
              <span className={styles.n}>{c.n}</span>
              <Icon name={KIND[c.kind].icon} size={15} />
              <span className={styles.title}>{c.title}</span>
              <Icon name={c.kind === "app" ? "chevronRight" : "arrowUpRight"} size={12} weight={2.2} className={styles.arrow} />
            </>
          );
          return (
            <li key={c.n}>
              {c.kind === "app" ? (
                <Link href={c.href} className={styles.source} data-kind={c.kind}>{inner}</Link>
              ) : (
                <a href={c.href} target="_blank" rel="noopener noreferrer" className={styles.source} data-kind={c.kind}>{inner}</a>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

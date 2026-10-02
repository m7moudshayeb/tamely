import type { Citation } from "@tamely/shared/types";
import { Link } from "wouter";
import styles from "./Citations.module.css";

/** Inline [n] mark. Internal sources navigate in-app; others open in a new tab. */
export function CitationChip({ c }: { c?: Citation }) {
  if (!c) return null;
  const label = `Source ${c.n}: ${c.title}`;
  if (c.kind === "app") return <Link href={c.href} className={styles.chip} title={c.title} aria-label={label}>{c.n}</Link>;
  return <a href={c.href} target="_blank" rel="noopener noreferrer" className={styles.chip} title={c.title} aria-label={label}>{c.n}</a>;
}

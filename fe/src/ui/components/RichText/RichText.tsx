import { Fragment, type ReactNode } from "react";
import { parseBlocks, type Inline } from "./parse";
import styles from "./RichText.module.css";

export interface RichTextProps {
  text: string;
  renderCite?: (n: number) => ReactNode;
  /** Links are rendered only when this returns true; otherwise plain text. */
  allowLink?: (href: string) => boolean;
  /** Numbered lists render as a step-by-step guide */
  stepsLabel?: string;
}

export function RichText({ text, renderCite, allowLink = () => false, stepsLabel = "Steps" }: RichTextProps) {
  const inline = (xs: Inline[]): ReactNode =>
    xs.map((x, i) => {
      switch (x.t) {
        case "text": return <Fragment key={i}>{x.v}</Fragment>;
        case "bold": return <strong key={i}>{inline(x.v)}</strong>;
        case "code": return <code key={i} className={styles.code}>{x.v}</code>;
        case "cite": return <Fragment key={i}>{renderCite ? renderCite(x.n) : null}</Fragment>;
        case "link":
          return allowLink(x.href) ? (
            <a key={i} href={x.href} className={styles.link} {...(x.href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{x.label}</a>
          ) : (
            <Fragment key={i}>{x.label}</Fragment>
          );
      }
    });
  return (
    <div className={styles.rich}>
      {parseBlocks(text).map((b, i) =>
        b.t === "p" ? (
          <p key={i}>{inline(b.v)}</p>
        ) : b.t === "ol" ? (
          <ol key={i} className={styles.steps} aria-label={stepsLabel}>
            {b.items.map((it, j) => (
              <li key={j}><span className={styles.num}>{j + 1}</span><span>{inline(it)}</span></li>
            ))}
          </ol>
        ) : (
          <ul key={i} className={styles.bullets}>
            {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
          </ul>
        ),
      )}
    </div>
  );
}

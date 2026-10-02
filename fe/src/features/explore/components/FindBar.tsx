import type { PageFind } from "../hooks/useFindOnPage";
import { Button, Icon, IconButton } from "@ui";
import styles from "./FindBar.module.css";

/** What the question matched on this page, with a way to ask the assistant instead. */
export function FindBar({ find, onReveal, onAsk, onClear }: { find: PageFind; onReveal: (id: string) => void; onAsk: () => void; onClear: () => void }) {
  const n = find.pages.length;
  return (
    <section className={styles.bar} aria-label="Found on this page" aria-live="polite">
      <div className={styles.head}>
        <Icon name="sparkles" size={14} />
        <p>
          {n === 1 ? "Here's the place" : `${n} places`} for <b>“{find.query}”</b>
        </p>
        <IconButton icon="xmark" label="Clear highlights" size={22} onClick={onClear} />
      </div>
      <div className={styles.chips}>
        {find.pages.map((p) => (
          <Button key={p.id} size="sm" variant="tinted" onClick={() => onReveal(p.id)}>{p.title}</Button>
        ))}
        <Button size="sm" variant="plain" trailingIcon="arrowUpRight" onClick={onAsk}>Ask the assistant</Button>
      </div>
    </section>
  );
}

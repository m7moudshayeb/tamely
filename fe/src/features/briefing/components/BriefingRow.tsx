import { Link } from "wouter";
import type { BriefingItem } from "@tamely/shared/types";
import { KIND } from "@shared/components/Citations";
import { ProposalCard } from "@shared/components/ProposalCard";
import { Button, Icon, isIconName } from "@ui";
import styles from "./BriefingMessage.module.css";

const TONE_ICON = { good: "checkCircle", attention: "exclamation", info: "info" } as const;

/** One line of the briefing: what it is, why it matters, and a one-tap fix or a question. */
export function BriefingRow({ item, zoneId, onAsk }: { item: BriefingItem; zoneId: string; onAsk: (q: string) => void }) {
  return (
    <li className={[styles.row, styles[item.tone]].join(" ")} data-testid="briefing-item">
      <span className={styles.icon}><Icon name={isIconName(item.icon) ? item.icon : TONE_ICON[item.tone]} size={15} /></span>
      <div className={styles.text}>
        <b>{item.title}</b>
        <span>{item.detail}</span>
        <span className={styles.sources}>
          {item.sources.map((s) =>
            s.kind === "app" ? (
              <Link key={s.href} href={s.href} title={s.title} aria-label={s.title}><Icon name={KIND[s.kind].icon} size={12} /></Link>
            ) : (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title} aria-label={s.title}><Icon name={KIND[s.kind].icon} size={12} /></a>
            ),
          )}
        </span>
      </div>
      <div className={styles.action}>
        {item.proposal ? <ProposalCard proposal={item.proposal} zoneId={zoneId} asButton /> : item.ask ? <Button size="sm" variant="gray" onClick={() => onAsk(item.ask!)}>Ask</Button> : null}
      </div>
    </li>
  );
}

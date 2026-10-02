import { useState } from "react";
import type { Proposal } from "@tamely/shared/types";
import { useConfirmProposal } from "../../hooks/useAction";
import { Badge, Button, Icon } from "@ui";
import styles from "./ProposalCard.module.css";

/** A prepared change. Runs only when the person presses Confirm. */
export function ProposalCard({ proposal, zoneId, compact, asButton }: { proposal: Proposal; zoneId?: string | null; compact?: boolean; asButton?: boolean }) {
  const confirm = useConfirmProposal(zoneId);
  const [dismissed, setDismissed] = useState(false);
  const done = confirm.isSuccess;
  if (dismissed) return null;
  if (asButton) {
    return done ? (
      <span className={styles.doneTag} role="status"><Icon name="checkCircle" size={13} /> Done</span>
    ) : (
      <Button size="sm" onClick={() => confirm.mutate(proposal.token)} loading={confirm.isPending} title={proposal.summary} data-testid="proposal">Fix it</Button>
    );
  }
  if (compact) {
    return (
      <div className={[styles.inline, done ? styles.done : ""].join(" ")} data-testid="proposal">
        <Icon name={done ? "checkCircle" : "wand"} size={15} />
        <span>{done ? confirm.data?.message : proposal.summary}</span>
        {!done && <Button size="sm" onClick={() => confirm.mutate(proposal.token)} loading={confirm.isPending}>Fix it</Button>}
        {confirm.isError && <p className={styles.error} role="alert">{(confirm.error as Error).message}</p>}
      </div>
    );
  }
  return (
    <div className={[styles.card, done ? styles.done : ""].join(" ")} data-testid="proposal">
      <span className={styles.icon}><Icon name={done ? "checkCircle" : "wand"} size={15} /></span>
      <div className={styles.body}>
        <div className={styles.top}>
          <b>{proposal.summary}</b>
          {!done && proposal.risk === "careful" && <Badge tone="attention" icon="exclamation">Check first</Badge>}
        </div>
        {done ? <p className={styles.result}>{confirm.data?.message}</p> : proposal.detail && <p>{proposal.detail}</p>}
        {confirm.isError && <p className={styles.error} role="alert">{(confirm.error as Error).message}</p>}
      </div>
      {!done && (
        <div className={styles.actions}>
          <Button size="sm" variant="gray" onClick={() => setDismissed(true)} disabled={confirm.isPending}>Not now</Button>
          <Button size="sm" onClick={() => confirm.mutate(proposal.token)} loading={confirm.isPending}>Confirm</Button>
        </div>
      )}
    </div>
  );
}

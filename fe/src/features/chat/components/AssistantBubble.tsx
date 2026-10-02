import { CitationChip, SourceList } from "@shared/components/Citations";
import { ProposalCard } from "@shared/components/ProposalCard";
import { isAppLink } from "@shared/lib/links";
import { ExternalLink, Icon, LogoMark, RichText } from "@ui";
import type { AssistantMessage } from "../types";
import { TrafficWidget } from "../widgets/TrafficWidget";
import { SidebarChangeCard } from "@features/shell/components/SidebarChange";
import styles from "./Bubbles.module.css";
import { StepTrail } from "./StepTrail";
import { WorkingIndicator } from "./WorkingIndicator";

export function AssistantBubble({ msg, zoneId }: { msg: AssistantMessage; zoneId: string | null }) {
  const cites = msg.answer?.citations || [];
  const allow = (href: string) => isAppLink(href) || cites.some((c) => c.href === href);
  const idle = msg.status === "streaming" && !msg.answer && !msg.steps.some((s) => s.status === "running");
  const label = msg.steps.length ? (msg.proposals.length || msg.sidebarChanges.length ? "Writing the answer…" : "Putting it together…") : "Thinking…";
  return (
    <article className={styles.assistant} aria-busy={msg.status === "streaming"} data-testid="assistant-message">
      <span className={styles.avatar}><LogoMark size={22} /></span>
      <div className={styles.content}>
        <StepTrail steps={msg.steps} />
        {idle && <WorkingIndicator label={label} />}
        {msg.answer && (
          <RichText
            text={msg.answer.text}
            allowLink={allow}
            renderCite={(n) => <CitationChip c={cites.find((c) => c.n === n)} />}
          />
        )}
        {msg.answer?.widgets.map((w) => (w.type === "traffic" ? <TrafficWidget key={w.type} zoneId={w.zoneId} range={w.range} /> : null))}
        {msg.proposals.map((p) => <ProposalCard key={p.id} proposal={p} zoneId={zoneId} />)}
        {msg.sidebarChanges.map((c) => <SidebarChangeCard key={c.id} change={c} />)}
        {msg.error && (
          <div className={styles.error} role="alert">
            <Icon name="exclamation" size={18} />
            <div>
              <p>{msg.error.message}</p>
              {msg.error.fix && <ExternalLink href={msg.error.fix.href}>{msg.error.fix.label}</ExternalLink>}
            </div>
          </div>
        )}
        {msg.status === "stopped" && <p className={styles.note}>Stopped.</p>}
        <SourceList citations={cites} />
      </div>
    </article>
  );
}

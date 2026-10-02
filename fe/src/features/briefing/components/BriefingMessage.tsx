import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { QK } from "@shared/constants/query";
import { relative } from "@shared/lib/format";
import { Button, IconButton, LogoMark, Skeleton } from "@ui";
import { useBriefing } from "../hooks/useBriefing";
import { BriefingMetrics } from "./BriefingMetrics";
import styles from "./BriefingMessage.module.css";
import { BriefingRow } from "./BriefingRow";

/** Today's briefing, written as the assistant's first message in the chat. */
export function BriefingMessage({ zoneId, onAsk }: { zoneId: string; onAsk: (q: string) => void }) {
  const q = useBriefing(zoneId);
  const qc = useQueryClient();
  const [showInfo, setShowInfo] = useState(false);
  const items = q.data?.items || [];
  const metrics = items.filter((i) => i.metric);
  const todo = items.filter((i) => !i.metric && i.tone !== "info");
  const info = items.filter((i) => !i.metric && i.tone === "info");

  return (
    <section className={styles.message} aria-label="Briefing">
      <span className={styles.avatar}><LogoMark size={22} /></span>
      <div className={styles.body}>
        <div className={styles.head}>
          <p className={styles.hello}>
            {q.data ? <b>{q.data.headline}</b> : <Skeleton width={240} height={14} />}
          </p>
          <IconButton icon="arrowClockwise" label="Refresh briefing" size={22} onClick={() => qc.invalidateQueries({ queryKey: QK.site(zoneId) })} disabled={q.isFetching} />
        </div>
        {q.isLoading && <Skeleton height={64} radius={9} />}
        {q.isError && <p className={styles.error}>{(q.error as Error).message}</p>}
        {q.data && (
          <>
            <BriefingMetrics items={metrics} />
            {todo.length > 0 && <ul className={styles.list}>{todo.map((it) => <BriefingRow key={it.id} item={it} zoneId={zoneId} onAsk={onAsk} />)}</ul>}
            {info.length > 0 && (
              <>
                <Button size="sm" variant="plain" onClick={() => setShowInfo((s) => !s)} aria-expanded={showInfo} trailingIcon={showInfo ? "chevronUp" : "chevronDown"}>
                  {showInfo ? "Hide tips" : `${info.length} tip${info.length === 1 ? "" : "s"} for you`}
                </Button>
                {showInfo && <ul className={styles.list}>{info.map((it) => <BriefingRow key={it.id} item={it} zoneId={zoneId} onAsk={onAsk} />)}</ul>}
              </>
            )}
            <p className={styles.when}>Updated {relative(q.data.generatedAt)}</p>
          </>
        )}
      </div>
    </section>
  );
}

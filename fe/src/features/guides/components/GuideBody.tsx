import { CitationChip } from "@shared/components/Citations";
import { relative } from "@shared/lib/format";
import { Button, Icon, RichText, Skeleton } from "@ui";
import { WorkingIndicator } from "@features/chat/components/WorkingIndicator";
import { useGuide } from "../hooks/useGuide";
import styles from "../GuidePage.module.css";

/** The written guide: loading, a plain error with retry, or the cited steps. */
export function GuideBody({ pageId, zoneId }: { pageId: string; zoneId: string | null }) {
  const q = useGuide(pageId, zoneId);
  if (q.isPending) {
    return (
      <div className={styles.loading} aria-busy="true">
        <WorkingIndicator label="Reading Cloudflare's docs…" />
        <Skeleton height={14} width="80%" />
        <Skeleton height={14} width="65%" />
        <Skeleton height={14} width="72%" />
      </div>
    );
  }
  if (q.isError) {
    return (
      <div className={styles.error} role="alert">
        <Icon name="exclamation" size={16} />
        <p>{(q.error as Error).message}</p>
        <Button size="sm" variant="gray" icon="arrowClockwise" onClick={() => q.refetch()} loading={q.isFetching}>Try again</Button>
      </div>
    );
  }
  const cites = q.data.citations;
  return (
    <div className={styles.guide} data-testid="guide">
      <RichText text={q.data.text} allowLink={(href) => cites.some((c) => c.href === href)} renderCite={(n) => <CitationChip c={cites.find((c) => c.n === n)} />} />
      <p className={styles.credit}>
        <Icon name="sparkles" size={12} /> Written from Cloudflare's docs by the AI in your Cloudflare account · {relative(q.data.generatedAt)}
      </p>
    </div>
  );
}

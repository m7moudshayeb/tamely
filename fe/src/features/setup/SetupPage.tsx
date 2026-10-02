import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { buildTokenUrl } from "@tamely/shared/token";
import { ChecksList } from "@features/connect/components/ChecksList";
import { useChecks } from "@features/connect/hooks/useChecks";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import type { ApiFailure } from "@shared/api/errors";
import { QK } from "@shared/constants/query";
import { useDashLink } from "@shared/hooks/useDashLink";
import { useConnect } from "@shared/hooks/useSession";
import { Button, Card, ExternalLink, Group, IconButton, IconTile, LinkButton, ListRow, TextField } from "@ui";
import styles from "./SetupPage.module.css";

export default function SetupPage() {
  const checks = useChecks(true);
  const qc = useQueryClient();
  const connect = useConnect();
  const [token, setToken] = useState("");
  const ai = useDashLink("workers-ai");

  const replace = (e: FormEvent) => {
    e.preventDefault();
    connect.mutate(token.trim(), { onSuccess: () => setToken("") });
  };

  return (
    <Page>
      <PageHeader icon="question" color="graphite" title="Setup & help" subtitle="What works with your key, how to fix what doesn't, and how the free assistant works." />

      <Group title="What works" action={<IconButton icon="arrowClockwise" label="Check again" onClick={() => qc.invalidateQueries({ queryKey: QK.checks })} disabled={checks.isFetching} />}>
        <div className={styles.pad}><ChecksList checks={checks.data} loading={checks.isLoading || checks.isFetching} /></div>
      </Group>

      <Card padding="lg" className={styles.card}>
        <IconTile icon="key" color="brand" size={22} />
        <h2>Your Cloudflare key</h2>
        <p>Something missing above? Create a new key: we open Cloudflare with every permission already filled in. Then paste it here to replace the old one.</p>
        <ol className={styles.steps}>
          <li>Press <b>Create a new key</b>.</li>
          <li>On Cloudflare, scroll down, press <b>Continue to summary</b>, then <b>Create Token</b>.</li>
          <li>Copy the token, paste it below and press <b>Replace</b>.</li>
        </ol>
        <div className={styles.row}>
          <LinkButton href={buildTokenUrl()} external icon="key">Create a new key</LinkButton>
          <ExternalLink href="https://dash.cloudflare.com/profile/api-tokens">Manage old keys</ExternalLink>
        </div>
        <form className={styles.replace} onSubmit={replace}>
          <TextField label="New token" hideLabel type="password" placeholder="Paste the new token" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} error={(connect.error as ApiFailure | null)?.message} />
          <Button type="submit" loading={connect.isPending} disabled={!token.trim()}>Replace</Button>
        </form>
      </Card>

      <Group title="The free assistant" footer={<ExternalLink href="https://developers.cloudflare.com/workers-ai/platform/pricing/">How Cloudflare's free AI allowance works</ExternalLink>}>
        <ListRow leading={<IconTile icon="sparkles" color="purple" size={18} />} title="Runs on Cloudflare AI in your account" subtitle="Your questions go to Cloudflare's own models under your key. No other AI company is involved." />
        <ListRow leading={<IconTile icon="clock" color="blue" size={18} />} title="10,000 free units every day" subtitle="A question uses a small part of that. It resets daily at midnight UTC." />
        <ListRow leading={<IconTile icon="shieldCheck" color="green" size={18} />} title="It can only suggest" subtitle="Every change shows a Confirm card first. Nothing happens without your tap." />
        {ai && <ListRow leading={<IconTile icon="chart" color="brand" size={18} />} title="See your AI usage on Cloudflare" href={ai.dash} external />}
      </Group>
    </Page>
  );
}

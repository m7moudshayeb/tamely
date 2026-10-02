import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EmailForward, Site } from "@tamely/shared/types";
import { api } from "@shared/api/endpoints";
import { QK } from "@shared/constants/query";
import { useAction } from "@shared/hooks/useAction";
import { Badge, Button, Card, EmptyState, Group, IconButton, IconTile, ListRow, Sheet, Skeleton, TextField } from "@ui";
import { NeedSite } from "@features/shell/components/NeedSite";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import styles from "./EmailPage.module.css";

function Forwarding({ site }: { site: Site }) {
  const q = useQuery({ queryKey: QK.email(site.id), queryFn: () => api.email(site.id) });
  const act = useAction();
  const [from, setFrom] = useState("hello");
  const [to, setTo] = useState("");
  const [removing, setRemoving] = useState<EmailForward | null>(null);

  const add = (e: FormEvent) => {
    e.preventDefault();
    act.mutate({ kind: "add_forward", zoneId: site.id, from, to }, { onSuccess: () => setTo("") });
  };

  if (q.isLoading) return <Skeleton height={260} radius={16} />;
  if (q.isError) return <EmptyState icon="exclamation" title="Couldn't load email settings">{(q.error as Error).message}</EmptyState>;
  return (
    <>
      <Card padding="lg">
        <form className={styles.form} onSubmit={add}>
          <h2>Add an address</h2>
          <div className={styles.row}>
            <TextField label="New address" value={from} onChange={(e) => setFrom(e.target.value)} suffix={<span>@{site.name}</span>} />
            <span className={styles.arrow} aria-hidden>→</span>
            <TextField label="Send to inbox" type="email" placeholder="you@gmail.com" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className={styles.actions}>
            <p>First time? Cloudflare emails that inbox a confirmation link.</p>
            <Button type="submit" icon="plus" loading={act.isPending} disabled={!from.trim() || !to.trim()}>Add forwarding</Button>
          </div>
        </form>
      </Card>
      <Group title="Forwarding" action={q.data!.enabled ? <Badge tone="good" icon="checkCircle">On</Badge> : <Badge>Off</Badge>}>
        {q.data!.forwards.length ? (
          q.data!.forwards.map((f) => (
            <ListRow
              key={f.id}
              leading={<IconTile icon="envelope" color="blue" size={18} />}
              title={f.from}
              subtitle={`Goes to ${f.to}`}
              trailing={<>{!f.enabled && <Badge>Paused</Badge>}<IconButton icon="trash" label={`Stop forwarding ${f.from}`} onClick={() => setRemoving(f)} size={32} /></>}
            />
          ))
        ) : (
          <ListRow title="No addresses yet" subtitle="Add one above, like hello@ or support@." />
        )}
      </Group>
      <Sheet
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title="Stop forwarding?"
        subtitle={removing ? `Mail to ${removing.from} won't reach ${removing.to} any more.` : ""}
        footer={
          <>
            <Button variant="gray" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="danger" icon="trash" loading={act.isPending} onClick={() => removing && act.mutate({ kind: "delete_forward", zoneId: site.id, ruleId: removing.id, label: removing.from }, { onSuccess: () => setRemoving(null) })}>Stop</Button>
          </>
        }
      />
    </>
  );
}

export default function EmailPage() {
  return (
    <Page>
      <PageHeader icon="envelope" color="blue" title="Email" subtitle="Addresses at your domain, delivered to the inbox you already use." sourceId="email-routing" />
      <NeedSite>{(site) => <Forwarding site={site} />}</NeedSite>
    </Page>
  );
}

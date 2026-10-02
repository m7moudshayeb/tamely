import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Redirect, Site } from "@tamely/shared/types";
import { api } from "@shared/api/endpoints";
import { QK } from "@shared/constants/query";
import { useAction } from "@shared/hooks/useAction";
import { Badge, Button, Card, EmptyState, Group, IconButton, IconTile, ListRow, SegmentedControl, Sheet, Skeleton, TextField } from "@ui";
import { NeedSite } from "@features/shell/components/NeedSite";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import styles from "./RedirectsPage.module.css";

function Redirects({ site }: { site: Site }) {
  const q = useQuery({ queryKey: QK.redirects(site.id), queryFn: () => api.redirects(site.id) });
  const act = useAction();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState<"permanent" | "temporary">("permanent");
  const [removing, setRemoving] = useState<Redirect | null>(null);

  const add = (e: FormEvent) => {
    e.preventDefault();
    act.mutate({ kind: "add_redirect", zoneId: site.id, from, to, permanent: kind === "permanent" }, { onSuccess: () => (setFrom(""), setTo("")) });
  };

  return (
    <>
      <Card padding="lg">
        <form className={styles.form} onSubmit={add}>
          <h2>Add a redirect</h2>
          <TextField label="Old link" placeholder="/old-pricing" value={from} onChange={(e) => setFrom(e.target.value)} hint={`A page on ${site.name}, starting with /`} />
          <TextField label="New address" placeholder={`https://${site.name}/pricing`} value={to} onChange={(e) => setTo(e.target.value)} hint="The full address visitors should land on." />
          <div className={styles.actions}>
            <SegmentedControl label="How long" value={kind} onChange={setKind} options={[{ value: "permanent", label: "Forever (301)" }, { value: "temporary", label: "For now (302)" }]} />
            <Button type="submit" icon="plus" loading={act.isPending} disabled={!from.trim() || !to.trim()}>Add redirect</Button>
          </div>
        </form>
      </Card>
      {q.isLoading ? (
        <Skeleton height={140} radius={16} />
      ) : q.isError ? (
        <EmptyState icon="exclamation" title="Couldn't load redirects">{(q.error as Error).message}</EmptyState>
      ) : (
        <Group title="Active redirects">
          {q.data!.length ? (
            q.data!.map((r) => (
              <ListRow
                key={r.id}
                leading={<IconTile icon="signpost" color="purple" size={18} />}
                title={r.from}
                subtitle={`Sends visitors to ${r.to}`}
                trailing={<><Badge>{r.permanent ? "Forever" : "For now"}</Badge><IconButton icon="trash" label={`Remove redirect ${r.from}`} onClick={() => setRemoving(r)} size={32} /></>}
              />
            ))
          ) : (
            <ListRow title="No redirects yet" subtitle="Add one above to send an old link somewhere new." />
          )}
        </Group>
      )}
      <Sheet
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title="Remove this redirect?"
        subtitle={removing ? `${removing.from} will stop sending visitors to ${removing.to}.` : ""}
        footer={
          <>
            <Button variant="gray" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="danger" icon="trash" loading={act.isPending} onClick={() => removing && act.mutate({ kind: "delete_redirect", zoneId: site.id, rulesetId: removing.rulesetId, ruleId: removing.id, label: removing.from }, { onSuccess: () => setRemoving(null) })}>Remove</Button>
          </>
        }
      />
    </>
  );
}

export default function RedirectsPage() {
  return (
    <Page>
      <PageHeader icon="signpost" color="purple" title="Redirects" subtitle="Send visitors from an old link to a new address." sourceId="rules" />
      <NeedSite>{(site) => <Redirects site={site} />}</NeedSite>
    </Page>
  );
}

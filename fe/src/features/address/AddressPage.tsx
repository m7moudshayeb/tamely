import { useState } from "react";
import type { DnsRecord, Site } from "@tamely/shared/types";
import { useAction } from "@shared/hooks/useAction";
import { Badge, Button, EmptyState, Group, IconButton, IconTile, ListRow, Skeleton } from "@ui";
import { NeedSite } from "@features/shell/components/NeedSite";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import { AddRecordSheet } from "./components/AddRecordSheet";
import { ConfirmDelete } from "./components/ConfirmDelete";
import { useDns } from "./hooks/useDns";
import { describeRecord, typeIcon } from "./recordTypes";

const GROUPS: { title: string; types: string[]; footer: string }[] = [
  { title: "Website", types: ["A", "AAAA", "CNAME"], footer: "Where your website and apps live." },
  { title: "Email", types: ["MX"], footer: "Where your email is delivered." },
  { title: "Notes & verification", types: ["TXT"], footer: "Proof of ownership and email safety settings." },
];

function Records({ site }: { site: Site }) {
  const q = useDns(site.id);
  const act = useAction();
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<DnsRecord | null>(null);
  const short = (name: string) => (name === site.name ? "@ (main domain)" : name.replace(`.${site.name}`, ""));

  if (q.isLoading) return <Skeleton height={300} radius={16} />;
  if (q.isError) return <EmptyState icon="exclamation" title="Couldn't load records">{(q.error as Error).message}</EmptyState>;
  const records = q.data || [];
  const other = records.filter((r) => !GROUPS.some((g) => g.types.includes(r.type)));

  return (
    <>
      <div><Button icon="plus" onClick={() => setAdding(true)}>Add a record</Button></div>
      {GROUPS.map((g) => {
        const rows = records.filter((r) => g.types.includes(r.type));
        if (!rows.length) return null;
        return (
          <Group key={g.title} title={g.title} footer={g.footer}>
            {rows.map((r) => (
              <ListRow
                key={r.id}
                leading={<IconTile icon={typeIcon(r.type)} color={r.type === "MX" ? "blue" : r.type === "TXT" ? "graphite" : "teal"} size={18} />}
                title={short(r.name)}
                subtitle={describeRecord(r.type, r.content, r.priority)}
                trailing={
                  <>
                    {r.proxied && <Badge tone="good" icon="shieldCheck">Protected</Badge>}
                    {r.locked ? <Badge icon="lock">Managed</Badge> : <IconButton icon="trash" label={`Delete ${r.name}`} onClick={() => setToDelete(r)} size={32} />}
                  </>
                }
              />
            ))}
          </Group>
        );
      })}
      {other.length > 0 && (
        <Group title="Other" footer="Advanced records. Change them on Cloudflare if needed.">
          {other.map((r) => <ListRow key={r.id} leading={<IconTile icon="doc" color="graphite" size={18} />} title={short(r.name)} subtitle={`${r.type} · ${r.content}`} />)}
        </Group>
      )}
      {!records.length && <EmptyState icon="globe" title="No records yet">Add one to point your domain at your website.</EmptyState>}
      <AddRecordSheet site={site} open={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        open={!!toDelete}
        title="Delete this record?"
        detail={toDelete ? `${short(toDelete.name)}: ${describeRecord(toDelete.type, toDelete.content)}. Anything using it stops working.` : ""}
        busy={act.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && act.mutate({ kind: "delete_dns", zoneId: site.id, recordId: toDelete.id, label: toDelete.name }, { onSuccess: () => setToDelete(null) })}
      />
    </>
  );
}

export default function AddressPage() {
  return (
    <Page>
      <PageHeader icon="globe" color="teal" title="Your address" subtitle="These records tell the internet where your website and email live." sourceId="dns-records" />
      <NeedSite>{(site) => <Records site={site} />}</NeedSite>
    </Page>
  );
}

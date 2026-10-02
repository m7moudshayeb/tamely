import { useState } from "react";
import type { Site } from "@tamely/shared/types";
import { SwitchRow } from "@shared/components/SwitchRow";
import { useAction } from "@shared/hooks/useAction";
import { useProtection } from "@shared/hooks/useProtection";
import { useTraffic } from "@shared/hooks/useTraffic";
import { bytes } from "@shared/lib/format";
import { Button, Card, Donut, Group, IconTile, ListRow, Sheet, Skeleton } from "@ui";
import { NeedSite } from "@features/shell/components/NeedSite";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import styles from "./SpeedPage.module.css";

function Speed({ site }: { site: Site }) {
  const prot = useProtection(site.id);
  const traffic = useTraffic(site.id, "7d");
  const act = useAction();
  const [confirming, setConfirming] = useState(false);
  const t = traffic.data?.totals;
  return (
    <>
      <Card padding="lg" className={styles.hero}>
        <div className={styles.heroText}>
          <h2>Just updated your site?</h2>
          <p>Clear the saved copies so every visitor gets the newest version within a minute.</p>
          <Button icon="broom" onClick={() => setConfirming(true)}>Clear saved copies</Button>
        </div>
        {t ? (
          <Donut
            label="Requests served from cache this week"
            height={120}
            center={`${t.requests ? Math.round((t.cached / t.requests) * 100) : 0}%`}
            centerLabel="from cache"
            slices={[{ label: "From saved copies", value: t.cached }, { label: "From your server", value: Math.max(0, t.requests - t.cached) }]}
          />
        ) : traffic.isLoading ? <Skeleton width={120} height={120} radius={60} /> : null}
      </Card>
      {t && (
        <Group title="This week">
          <ListRow leading={<IconTile icon="bolt" color="yellow" size={18} />} title="Work saved for your server" trailing={<b>{bytes(t.cachedBytes)}</b>} />
          <ListRow leading={<IconTile icon="tray" color="blue" size={18} />} title="Total data sent to visitors" trailing={<b>{bytes(t.bytes)}</b>} />
        </Group>
      )}
      <Group title="While you work" footer="Turns itself off after 3 hours so you never forget it.">
        {prot.data ? <SwitchRow zoneId={site.id} k="dev_mode" value={prot.data.switches.dev_mode} icon="hammer" color="graphite" /> : <Skeleton height={40} />}
      </Group>
      <Sheet
        open={confirming}
        onClose={() => setConfirming(false)}
        size="sm"
        title="Clear saved copies?"
        subtitle={`Visitors of ${site.name} get fresh pages within a minute. Pages may load a little slower for a short while.`}
        footer={
          <>
            <Button variant="gray" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button icon="broom" loading={act.isPending} onClick={() => act.mutate({ kind: "clear_cache", zoneId: site.id }, { onSuccess: () => setConfirming(false) })}>Clear now</Button>
          </>
        }
      />
    </>
  );
}

export default function SpeedPage() {
  return (
    <Page>
      <PageHeader icon="bolt" color="yellow" title="Speed" subtitle="Cloudflare keeps saved copies of your pages close to visitors." sourceId="cache-config" />
      <NeedSite>{(site) => <Speed site={site} />}</NeedSite>
    </Page>
  );
}

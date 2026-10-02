import type { Site, SslMode } from "@tamely/shared/types";
import { SwitchRow } from "@shared/components/SwitchRow";
import { useDashLink } from "@shared/hooks/useDashLink";
import { useProtection } from "@shared/hooks/useProtection";
import { Badge, EmptyState, ExternalLink, Group, IconTile, ListRow, Skeleton } from "@ui";
import { NeedSite } from "@features/shell/components/NeedSite";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";

const SSL: Record<SslMode, { label: string; tone: "good" | "attention" | "neutral"; text: string }> = {
  strict: { label: "Full (strict)", tone: "good", text: "Encrypted all the way to your server, with a checked certificate. The safest setting." },
  full: { label: "Full", tone: "good", text: "Encrypted all the way to your server." },
  flexible: { label: "Flexible", tone: "attention", text: "Encrypted to Cloudflare only. The last hop to your server isn't." },
  off: { label: "Off", tone: "attention", text: "Not encrypted. Visitors see 'Not secure'." },
  unknown: { label: "Unknown", tone: "neutral", text: "Your token can't read this yet." },
};

function Settings({ site }: { site: Site }) {
  const q = useProtection(site.id);
  const ssl = useDashLink("ssl-overview");
  if (q.isLoading) return <Skeleton height={360} radius={16} />;
  if (q.isError) return <EmptyState icon="exclamation" title="Couldn't load your settings">{(q.error as Error).message}</EmptyState>;
  const { switches, sslMode } = q.data!;
  const mode = SSL[sslMode];
  return (
    <>
      <Group title="Padlock" footer={ssl ? <ExternalLink href={ssl.dash}>Change encryption on Cloudflare</ExternalLink> : undefined}>
        <ListRow leading={<IconTile icon="lock" color="green" size={18} />} title={<>Encryption <Badge tone={mode.tone}>{mode.label}</Badge></>} subtitle={mode.text} />
        <SwitchRow zoneId={site.id} k="always_https" value={switches.always_https} icon="lock" color="green" />
      </Group>
      <Group title="Attacks & bots">
        <SwitchRow zoneId={site.id} k="bot_fight" value={switches.bot_fight} icon="shield" color="brand" />
        <SwitchRow zoneId={site.id} k="block_ai_bots" value={switches.block_ai_bots} icon="sparkles" color="purple" />
        <SwitchRow zoneId={site.id} k="under_attack" value={switches.under_attack} icon="flame" color="red" />
      </Group>
      <Group title="Your content" footer="Small extras that stop scraping and image theft.">
        <SwitchRow zoneId={site.id} k="email_obfuscation" value={switches.email_obfuscation} icon="envelope" color="blue" />
        <SwitchRow zoneId={site.id} k="hotlink_protection" value={switches.hotlink_protection} icon="photo" color="pink" />
      </Group>
    </>
  );
}

export default function ProtectionPage() {
  return (
    <Page>
      <PageHeader icon="shield" color="green" title="Protection" subtitle="Big switches for the moments that matter. Each one says what it does." sourceId="sec-settings" />
      <NeedSite>{(site) => <Settings site={site} />}</NeedSite>
    </Page>
  );
}

import { useQuery } from "@tanstack/react-query";
import { workerUrl } from "@tamely/shared/catalog";
import { api } from "@shared/api/endpoints";
import { QK } from "@shared/constants/query";
import { useSession } from "@shared/hooks/useSession";
import { relative } from "@shared/lib/format";
import { EmptyState, Group, IconTile, ListRow, Skeleton } from "@ui";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";

export default function AppsPage() {
  const q = useQuery({ queryKey: QK.apps, queryFn: api.apps });
  const account = useSession().data?.account?.id;
  return (
    <Page>
      <PageHeader icon="cube" color="pink" title="Apps" subtitle="Websites and apps you've deployed on Cloudflare." sourceId="workers-pages" />
      {q.isLoading && <Skeleton height={200} radius={16} />}
      {q.isError && <EmptyState icon="exclamation" title="Couldn't load your apps">{(q.error as Error).message}</EmptyState>}
      {q.data && (q.data.length ? (
        <Group title={`${q.data.length} app${q.data.length === 1 ? "" : "s"}`} footer="Opens each app on Cloudflare, where you can see logs and settings.">
          {q.data.map((a) => (
            <ListRow
              key={a.name}
              leading={<IconTile icon="cube" color="pink" size={18} />}
              title={a.name}
              subtitle={`Updated ${relative(a.updated)}`}
              href={account ? workerUrl(account, a.name) : undefined}
              external
            />
          ))}
        </Group>
      ) : (
        <EmptyState icon="cube" title="No apps yet">Deploy a website or app on Cloudflare and it shows up here.</EmptyState>
      ))}
    </Page>
  );
}

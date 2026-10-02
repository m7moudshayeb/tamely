import type { ReactNode } from "react";
import type { Site } from "@tamely/shared/types";
import { useCurrentSite } from "@shared/context/SiteContext";
import { EmptyState, ExternalLink, Skeleton } from "@ui";

/** Renders children only when a website is selected; friendly states otherwise. */
export function NeedSite({ children }: { children: (site: Site) => ReactNode }) {
  const { site, loading, error } = useCurrentSite();
  if (loading) return <Skeleton height={200} radius={22} />;
  if (error) return <EmptyState icon="exclamation" title="Couldn't load your websites">{error.message}</EmptyState>;
  if (!site)
    return (
      <EmptyState icon="globe" title="No websites yet">
        Add a website on Cloudflare first, then come back. <ExternalLink href="https://developers.cloudflare.com/fundamentals/manage-domains/">How to add a site</ExternalLink>
      </EmptyState>
    );
  return <>{children(site)}</>;
}

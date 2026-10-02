import { useCurrentSite } from "@shared/context/SiteContext";
import { Badge, Select, Skeleton } from "@ui";

export function SiteSwitcher() {
  const { sites, site, setSiteId, loading } = useCurrentSite();
  if (loading) return <Skeleton height={34} radius={17} />;
  if (!sites.length) return null;
  return (
    <Select
      label="Website"
      hideLabel
      variant="pill"
      value={site?.id || null}
      onChange={setSiteId}
      options={sites.map((s) => ({
        value: s.id,
        label: s.name,
        icon: "globe",
        description: s.plan ? `${s.plan} plan` : undefined,
        trailing: s.status === "active" ? undefined : <Badge tone="attention">Setting up</Badge>,
      }))}
    />
  );
}

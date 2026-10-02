import { pageSources } from "../../../shared/lib/sources";
import { docsSource } from "../../../shared/lib/sources";
import type { BriefingRule } from "../types";

/** The site isn't live on Cloudflare until nameservers are switched. */
export const setupRule: BriefingRule = ({ site, accountId }) => {
  if (site.status === "active") return [];
  const ns = site.nameServers.length ? ` Set them to ${site.nameServers.join(" and ")}.` : "";
  return [
    {
      id: "setup-pending",
      tone: "attention",
      icon: "hourglass",
      title: `${site.name} isn't fully connected yet`,
      detail: `Cloudflare is waiting for you to change the nameservers where you bought the domain.${ns} It can take a few hours to finish.`,
      sources: [
        ...pageSources("domains", accountId, site.name, { app: false }).slice(0, 1),
        docsSource("Change your nameservers: Cloudflare docs", "https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/"),
      ],
      ask: `How do I finish connecting ${site.name}?`,
    },
  ];
};

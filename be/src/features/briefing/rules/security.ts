import type { BriefingItem } from "@tamely/shared/types";
import { pageSources } from "../../../shared/lib/sources";
import { makeProposal } from "../../actions/proposal";
import { compact } from "../format";
import type { BriefingRule } from "../types";

export const securityRule: BriefingRule = async ({ site, accountId, secret, protection, traffic }) => {
  if (!protection) return [];
  const { switches, sslMode } = protection;
  const items: BriefingItem[] = [];
  const propose = (key: Parameters<typeof makeProposal>[0] & { kind: "set_switch" }) => makeProposal(key, site.name, accountId, secret);

  if (switches.under_attack) {
    items.push({
      id: "under-attack-on",
      tone: "attention",
      icon: "flame",
      title: "Under attack mode is on",
      detail: "Every visitor sees a check before entering. Turn it off once the attack is over.",
      sources: pageSources("sec-settings", accountId, site.name),
      proposal: await propose({ kind: "set_switch", zoneId: site.id, key: "under_attack", on: false }),
    });
  }
  if (switches.dev_mode) {
    items.push({
      id: "dev-mode-on",
      tone: "attention",
      icon: "hammer",
      title: "Development mode is on",
      detail: "Visitors skip saved copies, so pages load slower. It switches itself off after 3 hours.",
      sources: pageSources("cache-config", accountId, site.name),
      proposal: await propose({ kind: "set_switch", zoneId: site.id, key: "dev_mode", on: false }),
    });
  }
  if (switches.always_https === false) {
    const insecure = traffic ? traffic.totals.requests - traffic.totals.encrypted : 0;
    items.push({
      id: "https-off",
      tone: "attention",
      icon: "lockOpen",
      title: "Some visitors use the insecure address",
      detail: insecure > 0
        ? `${compact(insecure)} visits this week used http://. Browsers mark those "Not secure". One switch fixes it.`
        : "Visitors who type http:// stay on the insecure version. One switch fixes it.",
      sources: pageSources("ssl-edge", accountId, site.name),
      proposal: await propose({ kind: "set_switch", zoneId: site.id, key: "always_https", on: true }),
    });
  }
  if (sslMode === "off" || sslMode === "flexible") {
    items.push({
      id: "ssl-weak",
      tone: "attention",
      icon: "lock",
      title: sslMode === "off" ? "Encryption is off" : "Encryption stops at Cloudflare",
      detail: "The link between Cloudflare and your server isn't encrypted. If your host supports https, switch to Full (strict) on Cloudflare.",
      sources: pageSources("ssl-overview", accountId, site.name, { app: false }),
      ask: "Is my SSL setup safe?",
    });
  }
  if (switches.block_ai_bots === false) {
    items.push({
      id: "ai-bots",
      tone: "info",
      icon: "sparkles",
      title: "AI crawlers can read your pages",
      detail: "Fine if you want to show up in AI answers. Block them if you'd rather keep your content out of AI training.",
      sources: pageSources("ai-security", accountId, site.name),
      proposal: await propose({ kind: "set_switch", zoneId: site.id, key: "block_ai_bots", on: true }),
    });
  }
  return items;
};

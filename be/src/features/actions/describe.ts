import type { Action } from "@tamely/shared/types";
import { SWITCHES } from "../../shared/constants/cloudflare";

const host = (name: string, site: string) => (name === "@" ? site : name.endsWith(site) ? name : `${name}.${site}`);

/** One plain sentence for the Confirm card. */
export function describe(a: Action, site: string): { summary: string; detail?: string; risk: "safe" | "careful" } {
  switch (a.kind) {
    case "set_switch": {
      const s = SWITCHES[a.key];
      return { summary: `Turn ${a.on ? "on" : "off"} ${s.label.toLowerCase()} for ${site}`, detail: a.on ? s.on : s.off, risk: s.risk };
    }
    case "clear_cache":
      return { summary: `Clear saved copies of ${site}`, detail: "Visitors get the newest version within a minute. Pages may load a little slower briefly.", risk: "safe" };
    case "add_dns": {
      const r = a.record;
      const verb = r.type === "MX" ? "receive email through" : r.type === "TXT" ? "carry the text" : "point to";
      const shield = r.type === "MX" || r.type === "TXT" ? "" : r.proxied === false ? " (not protected by Cloudflare)" : " (protected by Cloudflare)";
      return { summary: `Make ${host(r.name, site)} ${verb} ${r.content}${shield}`, detail: `${r.type} record. Usually works within a few minutes.`, risk: "careful" };
    }
    case "delete_dns":
      return { summary: `Delete the address record ${a.label || ""}`.trim(), detail: "Anything using this record stops working.", risk: "careful" };
    case "add_forward": {
      const from = a.from.includes("@") ? a.from : `${a.from}@${site}`;
      return { summary: `Forward ${from} to ${a.to}`, detail: "Turns on email forwarding if needed. The inbox owner may need to click a confirmation link.", risk: "safe" };
    }
    case "delete_forward":
      return { summary: `Stop forwarding ${a.label || "this address"}`, risk: "careful" };
    case "add_redirect": {
      const from = a.from.startsWith("/") ? a.from : `/${a.from}`;
      return { summary: `Send visitors from ${site}${from} to ${a.to}`, detail: a.permanent === false ? "Temporary redirect (302)." : "Permanent redirect (301).", risk: "safe" };
    }
    case "delete_redirect":
      return { summary: `Remove the redirect ${a.label || ""}`.trim(), risk: "careful" };
  }
}

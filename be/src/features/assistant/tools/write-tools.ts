import { SWITCH_KEYS, type Action } from "@tamely/shared/types";
import { makeProposal } from "../../actions/proposal";
import { needSite } from "./need-site";
import { NO_PARAMS, type ToolContext, type ToolDef } from "./types";

/** Writes never run here: they become signed Confirm cards. */
async function propose(ctx: ToolContext, build: (zoneId: string) => Action) {
  const site = needSite(ctx);
  const proposal = await makeProposal(build(site.id), site.name, ctx.accountId, ctx.secret);
  ctx.emit({ type: "proposal", proposal });
  return { data: `Prepared "${proposal.summary}". It happens only after the person presses Confirm on the card. Do not say it is done.` };
}

const s = (v: unknown) => String(v ?? "");

export const WRITE_TOOLS: ToolDef[] = [
  {
    name: "propose_switch",
    description: "Prepare turning a safety/speed switch on or off for the current website. The person must confirm.",
    parameters: { type: "object", properties: { key: { type: "string", enum: [...SWITCH_KEYS] }, on: { type: "boolean" } }, required: ["key", "on"] },
    step: "Preparing the change",
    run: (ctx, a) => propose(ctx, (zoneId) => ({ kind: "set_switch", zoneId, key: a.key as never, on: a.on === true || a.on === "true" })),
  },
  {
    name: "propose_clear_cache",
    description: "Prepare clearing all saved copies (cache) of the current website. The person must confirm.",
    parameters: NO_PARAMS,
    step: "Preparing the change",
    run: (ctx) => propose(ctx, (zoneId) => ({ kind: "clear_cache", zoneId })),
  },
  {
    name: "propose_add_dns",
    description: "Prepare adding a DNS record. name is the subdomain or @ for the main domain. MX needs priority. proxied (A/AAAA/CNAME) true = protected by Cloudflare; use false for email or verification records. The person must confirm.",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["A", "AAAA", "CNAME", "MX", "TXT"] },
        name: { type: "string" },
        content: { type: "string" },
        proxied: { type: "boolean" },
        priority: { type: "integer" },
      },
      required: ["type", "name", "content"],
    },
    step: "Preparing the change",
    run: (ctx, a) =>
      propose(ctx, (zoneId) => ({
        kind: "add_dns",
        zoneId,
        record: { type: s(a.type).toUpperCase() as never, name: s(a.name), content: s(a.content), proxied: a.proxied === undefined ? undefined : a.proxied !== false && a.proxied !== "false", priority: a.priority === undefined ? undefined : Number(a.priority) },
      })),
  },
  {
    name: "propose_delete_dns",
    description: "Prepare deleting a DNS record by its id from list_dns_records. The person must confirm.",
    parameters: { type: "object", properties: { record_id: { type: "string" }, label: { type: "string" } }, required: ["record_id", "label"] },
    step: "Preparing the change",
    run: (ctx, a) => propose(ctx, (zoneId) => ({ kind: "delete_dns", zoneId, recordId: s(a.record_id), label: s(a.label) })),
  },
  {
    name: "propose_email_forward",
    description: "Prepare forwarding an address on the current domain (e.g. hello) to an existing inbox. Turns forwarding on if needed. The person must confirm.",
    parameters: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } }, required: ["from", "to"] },
    step: "Preparing the change",
    run: (ctx, a) => propose(ctx, (zoneId) => ({ kind: "add_forward", zoneId, from: s(a.from), to: s(a.to) })),
  },
  {
    name: "propose_redirect",
    description: "Prepare redirecting a path on the current website (e.g. /old) to a full URL. permanent=true means 301. The person must confirm.",
    parameters: { type: "object", properties: { from: { type: "string" }, to: { type: "string" }, permanent: { type: "boolean" } }, required: ["from", "to"] },
    step: "Preparing the change",
    run: (ctx, a) => propose(ctx, (zoneId) => ({ kind: "add_redirect", zoneId, from: s(a.from), to: s(a.to), permanent: a.permanent !== false && a.permanent !== "false" })),
  },
];

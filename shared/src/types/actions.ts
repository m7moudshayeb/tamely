import type { NewDnsRecord } from "./dns";
import type { SwitchKey } from "./protection";

export type Action =
  | { kind: "set_switch"; zoneId: string; key: SwitchKey; on: boolean }
  | { kind: "clear_cache"; zoneId: string }
  | { kind: "add_dns"; zoneId: string; record: NewDnsRecord }
  | { kind: "delete_dns"; zoneId: string; recordId: string; label?: string }
  | { kind: "add_forward"; zoneId: string; from: string; to: string }
  | { kind: "delete_forward"; zoneId: string; ruleId: string; label?: string }
  | { kind: "add_redirect"; zoneId: string; from: string; to: string; permanent?: boolean }
  | { kind: "delete_redirect"; zoneId: string; rulesetId: string; ruleId: string; label?: string };

export type ActionKind = Action["kind"];

export interface ActionResult {
  message: string;
}

/** A change the assistant or briefing suggests; runs only after Confirm. */
export interface Proposal {
  id: string;
  summary: string;
  detail?: string;
  risk: "safe" | "careful";
  token: string;
}

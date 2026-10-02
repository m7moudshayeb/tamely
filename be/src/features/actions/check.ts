import { SWITCH_KEYS, type Action, type SwitchKey } from "@tamely/shared/types";
import { MSG } from "../../shared/constants/copy";
import { ZONE_ID } from "../../shared/constants/security";
import { str } from "../../shared/lib/body";
import { AppError } from "../../shared/lib/errors";
import { validateDns } from "../dns/validate";

/** Rebuilds an action from untrusted input, keeping only known fields. */
export function checkAction(input: unknown): Action {
  const a = (input || {}) as Record<string, unknown>;
  const zoneId = str(a.zoneId, 64);
  if (!ZONE_ID.test(zoneId)) throw new AppError(MSG.pickSite);
  const label = a.label ? str(a.label, 200) : undefined;
  switch (a.kind) {
    case "set_switch":
      if (!(SWITCH_KEYS as readonly string[]).includes(String(a.key))) throw new AppError("Unknown switch.");
      return { kind: "set_switch", zoneId, key: a.key as SwitchKey, on: a.on === true };
    case "clear_cache":
      return { kind: "clear_cache", zoneId };
    case "add_dns":
      return { kind: "add_dns", zoneId, record: validateDns(a.record as never) };
    case "delete_dns":
      return { kind: "delete_dns", zoneId, recordId: str(a.recordId, 64), label };
    case "add_forward":
      return { kind: "add_forward", zoneId, from: str(a.from, 200), to: str(a.to, 200) };
    case "delete_forward":
      return { kind: "delete_forward", zoneId, ruleId: str(a.ruleId, 64), label };
    case "add_redirect":
      return { kind: "add_redirect", zoneId, from: str(a.from, 600), to: str(a.to, 2048), permanent: a.permanent !== false };
    case "delete_redirect":
      return { kind: "delete_redirect", zoneId, rulesetId: str(a.rulesetId, 64), ruleId: str(a.ruleId, 64), label };
    default:
      throw new AppError("Unknown action.");
  }
}

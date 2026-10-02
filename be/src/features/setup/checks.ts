import type { SetupCheck } from "@tamely/shared/types";
import { buildTokenUrl } from "@tamely/shared/token";
import { AppError } from "../../shared/lib/errors";

type Probe = () => Promise<unknown>;

const FIX_TOKEN = { label: "Create a token with every permission", href: buildTokenUrl() };

/** Runs one probe and turns the outcome into a plain checklist row. */
export async function check(id: string, label: string, okDetail: string, probe: Probe, missingDetail: string): Promise<SetupCheck> {
  try {
    await probe();
    return { id, label, ok: true, detail: okDetail };
  } catch (e) {
    const code = e instanceof AppError ? e.code : undefined;
    if (code === "ai_limit") return { id, label, ok: false, detail: (e as AppError).message, fix: (e as AppError).fix };
    if (code === "no_permission" || code === "ai_permission" || code === "token_rejected") return { id, label, ok: false, detail: missingDetail, fix: FIX_TOKEN };
    return { id, label, ok: false, detail: e instanceof AppError ? e.message : "Couldn't check this right now." };
  }
}

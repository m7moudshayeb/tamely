import type { Action, Proposal } from "@tamely/shared/types";
import { MSG } from "../../shared/constants/copy";
import { PROPOSAL_TTL_MS } from "../../shared/constants/security";
import { randomId, sign, verify } from "../../shared/lib/crypto";
import { AppError } from "../../shared/lib/errors";
import { checkAction } from "./check";
import { describe } from "./describe";

interface SignedProposal {
  action: Action;
  accountId: string;
  exp: number;
}

/** A signed, short-lived change that only runs after the person presses Confirm. */
export async function makeProposal(input: Action, siteName: string, accountId: string, secret: string): Promise<Proposal> {
  const action = checkAction(input);
  const d = describe(action, siteName);
  const token = await sign({ action, accountId, exp: Date.now() + PROPOSAL_TTL_MS } satisfies SignedProposal, secret);
  return { id: randomId(), summary: d.summary, detail: d.detail, risk: d.risk, token };
}

export async function openProposal(token: string, accountId: string, secret: string): Promise<Action> {
  const p = await verify<SignedProposal>(token, secret);
  if (!p || p.accountId !== accountId) throw new AppError(MSG.proposalInvalid, 400, "proposal_invalid");
  if (Date.now() > p.exp) throw new AppError(MSG.proposalExpired, 400, "proposal_expired");
  return checkAction(p.action);
}

import type { AccountRef } from "@tamely/shared/types";
import { MSG } from "../../shared/constants/copy";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";

export async function listAccounts(cf: CfClient): Promise<AccountRef[]> {
  const accounts = await cf.get<{ id: string; name: string }[]>("/accounts?per_page=50");
  if (!accounts.length) throw new AppError(MSG.noAccount, 400, "no_account");
  return accounts.map((a) => ({ id: a.id, name: a.name }));
}

import type { CfClient } from "../../shared/lib/cf-client";

export interface AppInfo {
  name: string;
  updated: string;
}

export async function listApps(cf: CfClient, accountId: string): Promise<AppInfo[]> {
  const scripts = await cf.get<{ id: string; modified_on: string }[]>(`/accounts/${accountId}/workers/scripts`);
  return scripts.map((s) => ({ name: s.id, updated: s.modified_on })).sort((a, b) => b.updated.localeCompare(a.updated));
}

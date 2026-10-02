import type { CfClient } from "../../shared/lib/cf-client";

export async function clearCache(cf: CfClient, zoneId: string): Promise<void> {
  await cf.call("POST", `/zones/${zoneId}/purge_cache`, { purge_everything: true });
}

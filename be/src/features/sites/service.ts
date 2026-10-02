import type { Site } from "@tamely/shared/types";
import { SITES_PAGE_SIZE } from "../../shared/constants/cloudflare";
import { MSG } from "../../shared/constants/copy";
import { ZONE_ID } from "../../shared/constants/security";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";

interface CfZone {
  id: string;
  name: string;
  status: string;
  plan?: { name?: string };
  name_servers?: string[];
}

const memo = new WeakMap<CfClient, Promise<Site[]>>();

/** Websites on the account. Memoized per request (one client per request). */
export function listSites(cf: CfClient, accountId: string): Promise<Site[]> {
  let p = memo.get(cf);
  if (!p) {
    p = cf
      .get<CfZone[]>(`/zones?per_page=${SITES_PAGE_SIZE}&account.id=${encodeURIComponent(accountId)}`)
      .then((zones) =>
        zones
          .map((z) => ({ id: z.id, name: z.name, status: z.status, plan: z.plan?.name || "", nameServers: z.name_servers || [] }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    p.catch(() => memo.delete(cf));
    memo.set(cf, p);
  }
  return p;
}

/** Every zone id from a request is checked against the person's own account. */
export async function ensureOwnSite(cf: CfClient, accountId: string, zoneId: unknown): Promise<Site> {
  if (typeof zoneId !== "string" || !ZONE_ID.test(zoneId)) throw new AppError(MSG.pickSite, 400, "pick_site");
  const site = (await listSites(cf, accountId)).find((s) => s.id === zoneId);
  if (!site) throw new AppError(MSG.notYourSite, 404, "not_your_site");
  return site;
}

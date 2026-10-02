import type { Action, Site } from "@tamely/shared/types";
import { SWITCHES } from "../../shared/constants/cloudflare";
import type { CfClient } from "../../shared/lib/cf-client";
import { addDns, deleteDns } from "../dns/service";
import { addForward, deleteForward } from "../email/service";
import { setSwitch } from "../protection/service";
import { addRedirect, deleteRedirect } from "../redirects/service";
import { clearCache } from "../speed/service";

/** Runs a checked action against a site already verified to be on the account. */
export async function runAction(cf: CfClient, accountId: string, site: Site, a: Action): Promise<string> {
  switch (a.kind) {
    case "set_switch":
      await setSwitch(cf, site.id, a.key, a.on);
      return `${SWITCHES[a.key].label} is now ${a.on ? "on" : "off"}.`;
    case "clear_cache":
      await clearCache(cf, site.id);
      return "Saved copies cleared. Visitors get the newest version within a minute.";
    case "add_dns":
      await addDns(cf, site.id, a.record);
      return "Record added. It usually works within a few minutes.";
    case "delete_dns":
      await deleteDns(cf, site.id, a.recordId);
      return "Record deleted.";
    case "add_forward": {
      const { needsVerify } = await addForward(cf, site.name, site.id, accountId, a.from, a.to);
      return needsVerify
        ? `Forwarding is set. Cloudflare emailed ${a.to} a confirmation link. Click it to start receiving mail.`
        : "Forwarding is set up and working.";
    }
    case "delete_forward":
      await deleteForward(cf, site.id, a.ruleId);
      return "Forwarding removed.";
    case "add_redirect":
      await addRedirect(cf, site.name, site.id, a.from, a.to, a.permanent !== false);
      return "Redirect is live.";
    case "delete_redirect":
      await deleteRedirect(cf, site.id, a.rulesetId, a.ruleId);
      return "Redirect removed.";
  }
}

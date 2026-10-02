import type { BriefingItem, ProtectionState, Site, Traffic } from "@tamely/shared/types";

export interface BriefingContext {
  site: Site;
  accountId: string;
  secret: string;
  protection: ProtectionState | null;
  traffic: Traffic | null;
}

/** A rule looks at the context and returns zero or more items. */
export type BriefingRule = (ctx: BriefingContext) => Promise<BriefingItem[]> | BriefingItem[];

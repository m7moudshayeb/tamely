import type { Citation } from "./assistant";

/** A plain-words guide for one Cloudflare page, written from its official docs. */
export interface Guide {
  pageId: string;
  text: string;
  citations: Citation[];
  generatedAt: string;
}

import type { ChatEvent, ChatWidget, Site, Source } from "@tamely/shared/types";
import type { CfClient } from "../../../shared/lib/cf-client";

export interface ToolContext {
  cf: CfClient;
  accountId: string;
  secret: string;
  sites: Site[];
  site: Site | null;
  emit: (e: ChatEvent) => void;
}

export interface ToolOutput {
  data: unknown;
  sources?: Source[];
  widget?: ChatWidget;
}

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  /** Plain label shown while it runs, e.g. "Checking your address records" */
  step: string;
  run: (ctx: ToolContext, args: Record<string, unknown>) => Promise<ToolOutput>;
}

export const NO_PARAMS = { type: "object", properties: {} };

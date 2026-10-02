import type { SidebarChange } from "../sidebar";
import type { Proposal } from "./actions";
import type { Range } from "./analytics";
import type { Source } from "./sources";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface ChatRequest {
  turns: ChatTurn[];
  zoneId?: string | null;
}

export type StepStatus = "running" | "done" | "error";

export interface ChatStep {
  id: string;
  label: string;
  status: StepStatus;
}

export interface Citation extends Source {
  n: number;
}

export type ChatWidget = { type: "traffic"; zoneId: string; range: Range };

export interface ChatAnswer {
  /** Markdown-lite: paragraphs, **bold**, lists, and citation marks like [1]. */
  text: string;
  citations: Citation[];
  widgets: ChatWidget[];
}

/** Server-sent events emitted by POST /api/v1/assistant/chat. */
export type ChatEvent =
  | { type: "step"; step: ChatStep }
  | { type: "proposal"; proposal: Proposal }
  /** A sidebar rearrangement. Applied in the browser after Confirm; the server keeps nothing. */
  | { type: "sidebar"; change: SidebarChange }
  | { type: "answer"; answer: ChatAnswer }
  | { type: "error"; message: string; fix?: { label: string; href: string } }
  | { type: "done" };

import type { SidebarChange } from "@tamely/shared/sidebar";
import type { ChatAnswer, ChatStep, Proposal } from "@tamely/shared/types";

export interface UserMessage {
  id: string;
  role: "user";
  text: string;
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  status: "streaming" | "done" | "error" | "stopped";
  steps: ChatStep[];
  proposals: Proposal[];
  sidebarChanges: SidebarChange[];
  answer?: ChatAnswer;
  error?: { message: string; fix?: { label: string; href: string } };
}

export type Message = UserMessage | AssistantMessage;

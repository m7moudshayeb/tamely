import type { Proposal } from "./actions";
import type { Source } from "./sources";

export type BriefingTone = "good" | "attention" | "info";

export interface BriefingItem {
  id: string;
  tone: BriefingTone;
  icon: string;
  title: string;
  detail: string;
  metric?: { value: string; label: string; change?: number | null };
  series?: number[];
  sources: Source[];
  proposal?: Proposal;
  /** Prefilled question for the assistant. */
  ask?: string;
}

export interface Briefing {
  site: { id: string; name: string; status: string };
  generatedAt: string;
  headline: string;
  items: BriefingItem[];
}

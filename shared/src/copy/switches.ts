import type { SwitchKey } from "../types";

/** Plain labels and descriptions for every switch, used by the API, the briefing and the assistant. */
export const SWITCHES: Record<SwitchKey, { label: string; on: string; off: string; risk: "safe" | "careful" }> = {
  always_https: {
    label: "Always use the secure address",
    on: "Visitors who type http:// are sent to the secure https:// version.",
    off: "Visitors can still open the insecure http:// version.",
    risk: "safe",
  },
  under_attack: {
    label: "Under attack mode",
    on: "Every visitor sees a short check before entering. Use only during an attack.",
    off: "Visitors enter normally.",
    risk: "careful",
  },
  dev_mode: {
    label: "Development mode",
    on: "Saved copies are paused so you see changes instantly. Turns itself off after 3 hours.",
    off: "Visitors get fast saved copies.",
    risk: "careful",
  },
  block_ai_bots: {
    label: "Block AI crawlers",
    on: "Bots from AI companies can't read your pages.",
    off: "AI companies' bots can read your pages.",
    risk: "safe",
  },
  bot_fight: {
    label: "Bot fight mode",
    on: "Known bad bots are challenged or blocked.",
    off: "Bad bots are not challenged.",
    risk: "careful",
  },
  email_obfuscation: {
    label: "Hide email addresses from bots",
    on: "Email addresses on your pages are hidden from spam bots, but people still see them.",
    off: "Bots can scrape email addresses from your pages.",
    risk: "safe",
  },
  hotlink_protection: {
    label: "Stop image theft",
    on: "Other websites can't embed your images.",
    off: "Other websites can embed your images.",
    risk: "safe",
  },
};

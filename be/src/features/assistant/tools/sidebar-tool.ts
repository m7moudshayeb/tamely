import { resolveSidebarName, type SidebarRef } from "@tamely/shared/sidebar";
import { randomId } from "../../../shared/lib/crypto";
import type { ToolDef } from "./types";

const MAX_NAMES = 8;
const names = (v: unknown): string[] => (Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : []).map((x) => String(x).slice(0, 60)).filter(Boolean).slice(0, MAX_NAMES);

/** Rearranges the sidebar. It lives in the person's browser, so this only prepares a Confirm card. */
export const SIDEBAR_TOOL: ToolDef = {
  name: "propose_sidebar_change",
  description: "Prepare adding links to or removing links from the person's Tamely sidebar (the menu on the left). Use plain names, e.g. remove [\"Email\"], add [\"Web Analytics\"]. Anything removed stays in Everything else. The person must confirm.",
  parameters: {
    type: "object",
    properties: {
      add: { type: "array", items: { type: "string" }, description: "Names of pages or features to add" },
      remove: { type: "array", items: { type: "string" }, description: "Names of sidebar links to remove" },
    },
  },
  step: "Preparing your sidebar change",
  run: async (ctx, a) => {
    const add: SidebarRef[] = [];
    const remove: SidebarRef[] = [];
    const notes: string[] = [];
    for (const name of names(a.add)) {
      const hit = resolveSidebarName(name);
      if (!hit) notes.push(`Couldn't find "${name}".`);
      else {
        add.push(hit.ref);
        if (hit.label.toLowerCase() !== name.toLowerCase().trim()) notes.push(`"${name}" is the ${hit.label} link.`);
      }
    }
    for (const name of names(a.remove)) {
      const hit = resolveSidebarName(name);
      if (!hit) notes.push(`Couldn't find "${name}".`);
      else if (hit.fixed) notes.push(`${hit.label} always stays in the sidebar.`);
      else remove.push(hit.ref);
    }
    if (!add.length && !remove.length) return { data: { prepared: false, notes } };
    ctx.emit({ type: "sidebar", change: { id: randomId(), add, remove } });
    return { data: { prepared: true, notes, next: "A Confirm card is shown. Nothing changes until the person presses Confirm. Removed links stay in Everything else." } };
  },
};

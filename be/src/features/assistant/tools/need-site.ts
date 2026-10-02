import type { Site } from "@tamely/shared/types";
import { AppError } from "../../../shared/lib/errors";
import type { ToolContext } from "./types";

export function needSite(ctx: ToolContext): Site {
  if (!ctx.site) throw new AppError("No website is selected. Ask the person to pick one at the top of the screen.");
  return ctx.site;
}

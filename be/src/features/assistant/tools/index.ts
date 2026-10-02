import type { AiTool } from "../workers-ai";
import { HELP_TOOL } from "./help-tool";
import { SIDEBAR_TOOL } from "./sidebar-tool";
import { READ_TOOLS } from "./read-tools";
import type { ToolDef } from "./types";
import { WRITE_TOOLS } from "./write-tools";

export const TOOLS: ToolDef[] = [...READ_TOOLS, HELP_TOOL, ...WRITE_TOOLS, SIDEBAR_TOOL];

export const toolByName = (name: string): ToolDef | undefined => TOOLS.find((t) => t.name === name);

export const toolSchemas = (): AiTool[] =>
  TOOLS.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } }));

export type { ToolContext, ToolDef } from "./types";

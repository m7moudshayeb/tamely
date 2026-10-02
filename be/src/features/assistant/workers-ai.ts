import { buildTokenUrl } from "@tamely/shared/token";
import { AI_MAX_TOKENS, AI_TIMEOUT_MS } from "../../shared/constants/ai";
import { MSG } from "../../shared/constants/copy";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";

export interface AiToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export type AiMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string; tool_calls?: AiToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export interface AiTool {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

interface RawToolCall {
  id?: string;
  type?: string;
  function?: { name?: string; arguments?: unknown };
}

interface Completion {
  choices?: { message?: { content?: string | null; tool_calls?: RawToolCall[] } }[];
  errors?: { code: number; message: string }[];
  error?: { message?: string } | string;
}

const USAGE_URL = "https://developers.cloudflare.com/workers-ai/platform/pricing/";

function aiError(status: number, body: Completion | null): AppError {
  const text = JSON.stringify(body?.errors || body?.error || "").toLowerCase();
  if (status === 429 || /neuron|daily|quota|limit exceeded|3036/.test(text)) {
    return new AppError(MSG.aiLimit, 429, "ai_limit", { label: "About the free allowance", href: USAGE_URL });
  }
  if (status === 401 || status === 403 || /10000|not authorized|permission/.test(text)) {
    return new AppError(MSG.aiNoPermission, 403, "ai_permission", { label: "Create a new token", href: buildTokenUrl() });
  }
  return new AppError(MSG.aiDown, 502, "ai_down");
}

/** Some models write tool calls as text instead of structured calls; recover them. */
export function parseTextToolCalls(content: string): AiToolCall[] {
  const blocks = [...content.matchAll(/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g)].map((m) => m[1]);
  const trimmed = content.trim();
  if (!blocks.length && trimmed.startsWith("{") && trimmed.endsWith("}")) blocks.push(trimmed);
  const calls: AiToolCall[] = [];
  for (const b of blocks) {
    try {
      const j = JSON.parse(b) as { name?: string; arguments?: unknown; parameters?: unknown };
      if (typeof j.name !== "string") continue;
      const args = j.arguments ?? j.parameters ?? {};
      calls.push({ id: `call_${calls.length}_${Date.now()}`, type: "function", function: { name: j.name, arguments: typeof args === "string" ? args : JSON.stringify(args) } });
    } catch {
      /* not a tool call */
    }
  }
  return calls;
}

/** Some models send arguments as an object; the API expects a JSON string when we echo calls back. */
function normalizeCalls(calls: RawToolCall[] | undefined): AiToolCall[] {
  return (calls || [])
    .filter((c) => typeof c.function?.name === "string")
    .map((c, i) => ({
      id: c.id || `call_${i}_${Date.now()}`,
      type: "function" as const,
      function: { name: c.function!.name!, arguments: typeof c.function!.arguments === "string" ? c.function!.arguments : JSON.stringify(c.function!.arguments ?? {}) },
    }));
}

const clean = (s: string) => s.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/<\/?think>/g, "").trim();

/** One completion on the person's own Cloudflare account (OpenAI-compatible endpoint). */
export async function complete(
  cf: CfClient,
  accountId: string,
  models: string[],
  messages: AiMessage[],
  tools: AiTool[],
): Promise<{ content: string; toolCalls: AiToolCall[] }> {
  let last: AppError | null = null;
  for (const model of models) {
    const { status, json } = await cf.raw(
      "POST",
      `/accounts/${accountId}/ai/v1/chat/completions`,
      { model, messages, ...(tools.length ? { tools, tool_choice: "auto" } : {}), max_tokens: AI_MAX_TOKENS, temperature: 0.2 },
      AI_TIMEOUT_MS,
    );
    const body = json as Completion | null;
    const msg = body?.choices?.[0]?.message;
    if (status < 400 && msg) {
      const content = clean(msg.content || "");
      const structured = normalizeCalls(msg.tool_calls);
      const toolCalls = structured.length ? structured : parseTextToolCalls(content);
      if (toolCalls.length) return { content: structured.length ? content : "", toolCalls };
      if (content) return { content, toolCalls };
      last = new AppError(MSG.aiDown, 502, "ai_down"); // Empty reply (e.g. all tokens spent thinking): try the next model.
      continue;
    }
    last = aiError(status, body);
    if (last.code !== "ai_down") throw last; // Permission and allowance problems won't change with another model.
  }
  throw last || new AppError(MSG.aiDown, 502, "ai_down");
}

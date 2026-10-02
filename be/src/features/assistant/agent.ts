import type { ChatEvent, ChatTurn, ChatWidget, Citation } from "@tamely/shared/types";
import { AI_MAX_STEPS, AI_MAX_TURN_CHARS, AI_MAX_TURNS, AI_TOOL_RESULT_CHARS, TRAFFIC_QUESTION } from "../../shared/constants/ai";
import { MSG } from "../../shared/constants/copy";
import { randomId } from "../../shared/lib/crypto";
import { AppError } from "../../shared/lib/errors";
import { SourceRegistry } from "./citations";
import { systemPrompt } from "./prompt";
import { toolByName, toolSchemas, type ToolContext } from "./tools";
import { complete, type AiMessage } from "./workers-ai";

export interface ChatOptions extends Omit<ToolContext, "emit"> {
  turns: ChatTurn[];
  models: string[];
}

function toMessages(turns: ChatTurn[]): AiMessage[] {
  const msgs = turns
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.text === "string" && t.text.trim())
    .slice(-AI_MAX_TURNS)
    .map((t) => ({ role: t.role, content: t.text.slice(0, AI_MAX_TURN_CHARS) }) as AiMessage);
  while (msgs[0]?.role === "assistant") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") throw new AppError(MSG.typeMessage);
  return msgs;
}

function parseArgs(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  try {
    const v = JSON.parse(String(raw || "{}"));
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

interface PendingWidget {
  widget: ChatWidget;
  hrefs: string[];
}

/** A chart is shown only when the answer uses its numbers (cites them) or the question asks for them. */
function relevantWidgets(pending: PendingWidget[], cited: Citation[], question: string): ChatWidget[] {
  const used = new Set(cited.map((c) => c.href));
  return pending.filter((p) => p.hrefs.some((h) => used.has(h)) || TRAFFIC_QUESTION.test(question)).map((p) => p.widget);
}

/** Tool loop on Workers AI. Streams steps, proposals and the final cited answer. */
export async function runChat(opts: ChatOptions, emit: (e: ChatEvent) => void): Promise<void> {
  const ctx: ToolContext = { ...opts, emit };
  const registry = new SourceRegistry();
  const pending: PendingWidget[] = [];
  const question = opts.turns.filter((t) => t.role === "user").at(-1)?.text || "";
  const messages: AiMessage[] = [{ role: "system", content: systemPrompt(opts.site, opts.sites) }, ...toMessages(opts.turns)];
  const tools = toolSchemas();

  const thinking = { id: randomId(), label: "Reading your question" };
  emit({ type: "step", step: { ...thinking, status: "running" } });

  for (let i = 0; i < AI_MAX_STEPS; i++) {
    const { content, toolCalls } = await complete(opts.cf, opts.accountId, opts.models, messages, tools);
    if (i === 0) emit({ type: "step", step: { ...thinking, status: "done" } });

    if (!toolCalls.length) {
      const { text, citations } = registry.finalize(content || "I couldn't find an answer to that. Try asking another way.");
      emit({ type: "answer", answer: { text, citations: citations.length ? citations : registry.all().slice(0, 4), widgets: relevantWidgets(pending, citations, question) } });
      return;
    }

    messages.push({ role: "assistant", content: content || "", tool_calls: toolCalls });
    for (const call of toolCalls) {
      const tool = toolByName(call.function.name);
      const step = { id: randomId(), label: tool?.step || "Working on it" };
      emit({ type: "step", step: { ...step, status: "running" } });
      let result: string;
      try {
        if (!tool) throw new AppError("Unknown tool.");
        const out = await tool.run(ctx, parseArgs(call.function.arguments));
        if (out.widget && !pending.some((p) => p.widget.type === out.widget!.type)) pending.push({ widget: out.widget, hrefs: (out.sources || []).map((x) => x.href) });
        result = JSON.stringify(out.data).slice(0, AI_TOOL_RESULT_CHARS) + registry.label(out.sources || []);
        emit({ type: "step", step: { ...step, status: "done" } });
      } catch (e) {
        result = `Error: ${e instanceof AppError ? e.message : "it failed"}`;
        emit({ type: "step", step: { ...step, label: `${step.label}: ${e instanceof AppError ? e.message : "failed"}`, status: "error" } });
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
  emit({ type: "answer", answer: { text: MSG.aiTooLong, citations: [], widgets: [] } });
}

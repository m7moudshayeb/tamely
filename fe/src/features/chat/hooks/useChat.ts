import { useCallback, useSyncExternalStore } from "react";
import type { ChatEvent, ChatTurn } from "@tamely/shared/types";
import type { AssistantMessage, Message } from "../types";
import { chatStore } from "./chatStore";
import { streamChat } from "./streamChat";

const uid = () => Math.random().toString(36).slice(2, 10);
const plain = (text: string) => text.replace(/\[\d{1,3}\]/g, "").trim();

function toTurns(messages: Message[]): ChatTurn[] {
  return messages
    .map((m): ChatTurn | null =>
      m.role === "user" ? { role: "user", text: m.text } : m.answer ? { role: "assistant", text: plain(m.answer.text) } : null,
    )
    .filter((t): t is ChatTurn => !!t);
}

function apply(msg: AssistantMessage, e: ChatEvent): AssistantMessage {
  switch (e.type) {
    case "step": {
      const i = msg.steps.findIndex((s) => s.id === e.step.id);
      const steps = i < 0 ? [...msg.steps, e.step] : msg.steps.map((s, j) => (j === i ? e.step : s));
      return { ...msg, steps };
    }
    case "proposal":
      return { ...msg, proposals: [...msg.proposals, e.proposal] };
    case "sidebar":
      return { ...msg, sidebarChanges: [...msg.sidebarChanges, e.change] };
    case "answer":
      return { ...msg, answer: e.answer };
    case "error":
      return { ...msg, status: "error", error: { message: e.message, fix: e.fix } };
    case "done":
      return { ...msg, status: msg.status === "error" ? "error" : "done", steps: msg.steps.map((s) => (s.status === "running" ? { ...s, status: "done" } : s)) };
  }
}

/* Streams outlive the screen that started them, so they're tracked here, not in a component. */
const running = new Map<string, AbortController>();
const NO_SITE = "none";

/** Conversation state + streaming. Survives moving between screens; components never call the API directly. */
export function useChat(zoneId: string | null) {
  const zone = zoneId || NO_SITE;
  const messages = useSyncExternalStore(chatStore.subscribe, () => chatStore.get(zone), () => [] as Message[]);
  const busy = messages.some((m) => m.role === "assistant" && m.status === "streaming");

  const update = useCallback(
    (id: string, fn: (m: AssistantMessage) => AssistantMessage) => chatStore.set(zone, (xs) => xs.map((m) => (m.id === id && m.role === "assistant" ? fn(m) : m))),
    [zone],
  );

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      const user: Message = { id: uid(), role: "user", text: q };
      const reply: AssistantMessage = { id: uid(), role: "assistant", status: "streaming", steps: [], proposals: [], sidebarChanges: [] };
      const history = [...chatStore.get(zone), user];
      chatStore.set(zone, () => [...history, reply]);
      const ctrl = new AbortController();
      running.set(zone, ctrl);
      try {
        await streamChat({ turns: toTurns(history), zoneId }, (e) => update(reply.id, (m) => apply(m, e)), ctrl.signal);
        update(reply.id, (m) => (m.status === "streaming" ? apply(m, { type: "done" }) : m));
      } catch (err) {
        if (ctrl.signal.aborted) return;
        update(reply.id, (m) => ({ ...m, status: "error", error: { message: (err as Error).message } }));
      } finally {
        if (running.get(zone) === ctrl) running.delete(zone);
      }
    },
    [busy, zone, zoneId, update],
  );

  const stop = useCallback(() => {
    running.get(zone)?.abort();
    chatStore.set(zone, (xs) => xs.map((m) => (m.role === "assistant" && m.status === "streaming" ? { ...m, status: "stopped", steps: m.steps.map((s) => ({ ...s, status: s.status === "running" ? "error" : s.status })) } : m)));
  }, [zone]);

  const reset = useCallback(() => {
    running.get(zone)?.abort();
    chatStore.set(zone, () => []);
  }, [zone]);

  return { messages, send, stop, reset, busy };
}

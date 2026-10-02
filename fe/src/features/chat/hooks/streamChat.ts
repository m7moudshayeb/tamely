import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { ChatEvent, ChatRequest } from "@tamely/shared/types";
import { API, CSRF_HEADER } from "@shared/constants/api";

class FatalStreamError extends Error {}

/** POSTs a chat request and calls onEvent for each server-sent event. */
export async function streamChat(req: ChatRequest, onEvent: (e: ChatEvent) => void, signal: AbortSignal): Promise<void> {
  await fetchEventSource(`${API.base}${API.chat}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...CSRF_HEADER },
    credentials: "same-origin",
    body: JSON.stringify(req),
    signal,
    openWhenHidden: true,
    async onopen(res) {
      if (res.ok && res.headers.get("content-type")?.includes("text/event-stream")) return;
      const body = await res.json().catch(() => ({}));
      throw new FatalStreamError(body.error || "The assistant isn't available right now.");
    },
    onmessage(m) {
      if (!m.data) return;
      try {
        onEvent(JSON.parse(m.data) as ChatEvent);
      } catch {
        /* ignore malformed event */
      }
    },
    onerror(err) {
      throw err instanceof FatalStreamError ? err : new FatalStreamError("Lost the connection to the assistant. Try again.");
    },
  });
}

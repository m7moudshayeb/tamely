import { useEffect, useRef } from "react";
import type { Message } from "../types";
import { AssistantBubble } from "./AssistantBubble";
import styles from "./ChatThread.module.css";
import { UserBubble } from "./UserBubble";

export function ChatThread({ messages, zoneId }: { messages: Message[]; zoneId: string | null }) {
  const end = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, last]);
  return (
    <div className={styles.thread} role="log" aria-live="polite">
      {messages.map((m) => (m.role === "user" ? <UserBubble key={m.id} text={m.text} /> : <AssistantBubble key={m.id} msg={m} zoneId={zoneId} />))}
      <div ref={end} />
    </div>
  );
}

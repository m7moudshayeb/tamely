import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AutoTextArea, IconButton } from "@ui";
import styles from "./Composer.module.css";

export interface ComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
  placeholder: string;
  prefill?: { text: string; nonce: number } | null;
}

/** Enter sends, Shift+Enter adds a line. */
export function Composer({ onSend, onStop, busy, placeholder, prefill }: ComposerProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (prefill) {
      setText(prefill.text);
      ref.current?.focus();
    }
  }, [prefill]);
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || busy) return;
    onSend(text);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };
  return (
    <form className={styles.composer} onSubmit={submit}>
      <AutoTextArea ref={ref} minRows={2} label="Message the assistant" placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} maxLength={2000} />
      {busy ? (
        <IconButton icon="stop" label="Stop" variant="gray" size={26} onClick={onStop} />
      ) : (
        <IconButton icon="arrowUp" label="Send" variant="filled" size={26} type="submit" disabled={!text.trim()} />
      )}
    </form>
  );
}

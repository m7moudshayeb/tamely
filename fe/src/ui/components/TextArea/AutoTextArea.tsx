import { forwardRef, useEffect, useImperativeHandle, useRef, type TextareaHTMLAttributes } from "react";
import styles from "./AutoTextArea.module.css";

export interface AutoTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  minRows?: number;
  maxRows?: number;
}

/** Starts at minRows and grows with its content up to maxRows. Label is for screen readers. */
export const AutoTextArea = forwardRef<HTMLTextAreaElement, AutoTextAreaProps>(function AutoTextArea({ label, minRows = 1, maxRows = 6, className, value, ...rest }, ref) {
  const el = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLTextAreaElement);
  useEffect(() => {
    const t = el.current;
    if (!t) return;
    t.style.height = "auto";
    const line = parseFloat(getComputedStyle(t).lineHeight) || 22;
    t.style.height = `${Math.min(t.scrollHeight, line * maxRows + 4)}px`;
  }, [value, maxRows]);
  return <textarea ref={el} aria-label={label} rows={minRows} value={value} className={[styles.area, className || ""].join(" ")} {...rest} />;
});

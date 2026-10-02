import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  suffix?: ReactNode;
  hideLabel?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, suffix, hideLabel, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id || auto;
  const describedBy = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className={[styles.field, className || ""].join(" ")}>
      <label htmlFor={fid} className={hideLabel ? "sr-only" : styles.label}>{label}</label>
      <div className={[styles.box, error ? styles.invalid : ""].join(" ")}>
        <input ref={ref} id={fid} className={styles.input} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...rest} />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error ? <p id={`${fid}-err`} className={styles.error} role="alert">{error}</p> : hint ? <p id={`${fid}-hint`} className={styles.hint}>{hint}</p> : null}
    </div>
  );
});

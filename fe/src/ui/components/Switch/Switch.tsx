import styles from "./Switch.module.css";

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  busy?: boolean;
}

/** iOS-style toggle. Uses role="switch" on a button, never a native checkbox. */
export function Switch({ checked, onChange, label, disabled, busy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      className={[styles.track, checked ? styles.on : "", busy ? styles.busy : ""].join(" ")}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.thumb} />
    </button>
  );
}

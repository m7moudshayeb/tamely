import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon, type IconName } from "../../icons";
import styles from "./Select.module.css";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: IconName;
  trailing?: ReactNode;
}

export interface SelectProps<T extends string> {
  value: T | null;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  variant?: "field" | "pill";
  align?: "start" | "end";
}

/** Custom listbox (no native <select>): keyboard friendly, closes on outside click. */
export function Select<T extends string>({ value, options, onChange, label, hideLabel, placeholder = "Choose…", variant = "field", align = "start" }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const selected = options.find((o) => o.value === value) || null;

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    requestAnimationFrame(() => list.current?.focus());
    return () => document.removeEventListener("pointerdown", close);
  }, [open, options, value]);

  const pick = (i: number) => {
    const o = options[i];
    if (!o) return;
    onChange(o.value);
    setOpen(false);
  };

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.root} ref={root}>
      <span id={`${id}-label`} className={hideLabel ? "sr-only" : styles.label}>{label}</span>
      <button
        type="button"
        className={[styles.trigger, styles[variant]].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === "ArrowDown" ? (e.preventDefault(), setOpen(true)) : undefined)}
      >
        {selected?.icon && <Icon name={selected.icon} size={15} />}
        <span id={`${id}-value`} className={selected ? styles.value : styles.placeholder}>{selected?.label || placeholder}</span>
        <Icon name="chevronUpDown" size={15} weight={2} className={styles.chev} />
      </button>
      {open && (
        <ul
          ref={list}
          className={[styles.menu, align === "end" ? styles.end : ""].join(" ")}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={[styles.option, i === active ? styles.active : ""].join(" ")}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span className={styles.check}>{o.value === value && <Icon name="check" size={15} weight={2.4} />}</span>
              {o.icon && <Icon name={o.icon} size={15} />}
              <span className={styles.text}>
                <span>{o.label}</span>
                {o.description && <small>{o.description}</small>}
              </span>
              {o.trailing}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

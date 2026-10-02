import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../IconButton";
import styles from "./Sheet.module.css";
import { useFocusTrap } from "./useFocusTrap";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md";
}

/** Side panel on desktop, bottom sheet on phones. */
export function Sheet({ open, onClose, title, subtitle, children, footer, size = "md" }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useFocusTrap(ref, open, onClose);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className={styles.scrim} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={[styles.sheet, styles[size]].join(" ")} role="dialog" aria-modal="true" aria-labelledby={id}>
        <header className={styles.head}>
          <div>
            <h2 id={id} className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <IconButton icon="xmark" label="Close" variant="gray" size={26} onClick={onClose} />
        </header>
        {children && <div className={styles.body}>{children}</div>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

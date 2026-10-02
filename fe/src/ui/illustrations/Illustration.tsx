import type { CSSProperties, ReactNode } from "react";
import type { TileColor } from "../components/IconTile";
import styles from "./Illustration.module.css";

/** Frame for a small animated scene. Decorative: hidden from screen readers. */
export function Illustration({ color = "graphite", children }: { color?: TileColor; children: ReactNode }) {
  return (
    <svg className={styles.root} data-color={color} viewBox="0 0 160 80" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false">
      {children}
    </svg>
  );
}

/** Per-element timing, e.g. <rect style={t({ d: "0.4s" })} />. */
export const t = (v: { d?: string; t?: string; x?: string }): CSSProperties =>
  Object.fromEntries(Object.entries(v).map(([k, val]) => [`--${k}`, val])) as CSSProperties;

export const s = styles;

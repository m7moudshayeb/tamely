import type { ReactNode } from "react";
import styles from "./Page.module.css";

export function Page({ children, wide, size }: { children: ReactNode; wide?: boolean; size?: "xl" }) {
  return <div className={[styles.page, wide ? styles.wide : "", size === "xl" ? styles.xl : ""].join(" ")}>{children}</div>;
}

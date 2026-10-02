import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./Skeleton.module.css";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

/** Loading placeholder. Size is set from script, not a style attribute, so the strict CSP never blocks it. */
export function Skeleton({ width = "100%", height = 14, radius = 6 }: { width?: number | string; height?: number | string; radius?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useIsoLayoutEffect(() => {
    const s = ref.current?.style;
    if (!s) return;
    s.width = px(width);
    s.height = px(height);
    s.borderRadius = px(radius);
  }, [width, height, radius]);
  return <span ref={ref} className={styles.sk} aria-hidden />;
}

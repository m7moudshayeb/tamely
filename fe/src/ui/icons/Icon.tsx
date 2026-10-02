import type { CSSProperties } from "react";
import { ICONS, type IconLayer, type IconName } from "./paths";

export interface IconProps {
  name: IconName;
  size?: number;
  /** Stroke weight; the set is drawn for 1.7 */
  weight?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

/** Hierarchical icon: soft layer at low opacity, stroked layer on top. */
export function Icon({ name, size = 20, weight = 1.7, className, style, label }: IconProps) {
  const layers: readonly IconLayer[] = ICONS[name] ?? ICONS.info;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {layers.map((l, i) =>
        l.kind === "soft" ? (
          <path key={i} d={l.d} fill="currentColor" opacity={0.16} />
        ) : l.kind === "fill" ? (
          <path key={i} d={l.d} fill="currentColor" />
        ) : l.kind === "solid" ? (
          <path key={i} d={l.d} fill="currentColor" opacity={0.18} />
        ) : (
          <path key={i} d={l.d} stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </svg>
  );
}

export const isIconName = (v: string): v is IconName => v in ICONS;

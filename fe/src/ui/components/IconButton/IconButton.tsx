import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../../icons";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  variant?: "plain" | "gray" | "filled";
  size?: number;
  /** Defaults to half the button size. */
  iconSize?: number;
}

/** Icon-only button. label is required for screen readers and shows as a tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = "plain", size = 26, iconSize, className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={[styles.btn, styles[variant], className || ""].join(" ")}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.5)} weight={1.9} />
    </button>
  );
});

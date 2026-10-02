import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon, type IconName } from "../../icons";
import { Spinner } from "../Spinner";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "ink" | "tinted" | "gray" | "plain" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  block?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "filled", size = "md", icon, trailingIcon, loading, block, className, children, disabled, type = "button", ...rest },
  ref,
) {
  const iconSize = size === "lg" ? 15 : size === "sm" ? 12 : 13;
  return (
    <button
      ref={ref}
      type={type}
      className={[styles.btn, styles[variant], styles[size], block ? styles.block : "", className || ""].join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={iconSize - 2} /> : icon ? <Icon name={icon} size={iconSize} weight={2} /> : null}
      {children && <span>{children}</span>}
      {trailingIcon && !loading && <Icon name={trailingIcon} size={iconSize - 2} weight={2} />}
    </button>
  );
});

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../../icons";
import styles from "./Button.module.css";

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "filled" | "ink" | "tinted" | "gray" | "plain";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  trailingIcon?: IconName;
  external?: boolean;
  children: ReactNode;
}

/** An anchor that looks like a Button. External links open in a new tab. */
export function LinkButton({ variant = "filled", size = "md", icon, trailingIcon, external, className, children, ...rest }: LinkButtonProps) {
  const iconSize = size === "lg" ? 15 : size === "sm" ? 12 : 13;
  return (
    <a className={[styles.btn, styles[variant], styles[size], className || ""].join(" ")} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {icon && <Icon name={icon} size={iconSize} weight={2} />}
      <span>{children}</span>
      {(trailingIcon || external) && <Icon name={trailingIcon || "arrowUpRight"} size={iconSize - 2} weight={2.2} />}
    </a>
  );
}

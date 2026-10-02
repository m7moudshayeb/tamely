import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "md" | "lg";
  tone?: "default" | "inset" | "accent";
  children: ReactNode;
}

export function Card({ padding = "md", tone = "default", className, children, ...rest }: CardProps) {
  return (
    <div className={[styles.card, styles[`p_${padding}`], styles[tone], className || ""].join(" ")} {...rest}>
      {children}
    </div>
  );
}

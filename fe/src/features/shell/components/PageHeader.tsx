import type { ReactNode } from "react";
import { SourceLinks } from "@shared/components/SourceLinks";
import { IconTile, type IconName, type TileColor } from "@ui";
import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  icon: IconName;
  color: TileColor;
  title: string;
  subtitle?: ReactNode;
  sourceId?: string;
  actions?: ReactNode;
}

/** Large title, one-line explanation, and where this lives on Cloudflare. */
export function PageHeader({ icon, color, title, subtitle, sourceId, actions }: PageHeaderProps) {
  return (
    <header className={styles.head}>
      <div className={styles.titleRow}>
        <IconTile icon={icon} color={color} size={22} />
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {sourceId && <SourceLinks pageId={sourceId} />}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

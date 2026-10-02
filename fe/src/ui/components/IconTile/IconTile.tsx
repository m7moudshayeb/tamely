import { Icon, type IconName } from "../../icons";
import styles from "./IconTile.module.css";

export type TileColor = "brand" | "blue" | "green" | "teal" | "pink" | "purple" | "yellow" | "graphite" | "red";

/** Colored rounded-square icon, like iOS Settings rows. */
export function IconTile({ icon, color = "brand", size = 30 }: { icon: IconName; color?: TileColor; size?: number }) {
  return (
    <span className={styles.tile} style={{ width: size, height: size, background: `var(--c-tile-${color})`, borderRadius: size * 0.26 }}>
      <Icon name={icon} size={Math.round(size * 0.62)} weight={1.9} />
    </span>
  );
}

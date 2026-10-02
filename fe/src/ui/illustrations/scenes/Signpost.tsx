import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** A signpost sending visitors to a new page. */
export function Signpost({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <rect className={s.paper} x="12" y="22" width="26" height="34" rx="4" />
      <path className={s.line} d="M18 32h14M18 39h10" />
      <rect className={s.paper} x="122" y="22" width="26" height="34" rx="4" />
      <rect className={s.soft} x="128" y="29" width="14" height="10" rx="2" />
      <path className={s.line} d="M128 45h14" />
      <rect className={s.inset} x="78" y="30" width="4" height="40" rx="2" />
      <g className={s.swing}>
        <path className={s.main} d="M64 18h30l8 7-8 7H64z" />
        <path className={s.soft} d="M96 36H68l-7 6 7 6h28z" />
      </g>
      <path className={[s.line, s.flow].join(" ")} d="M40 66h80" />
      <circle className={[s.main, s.travel].join(" ")} style={t({ x: "76px" })} cx="42" cy="66" r="2.5" />
    </Illustration>
  );
}

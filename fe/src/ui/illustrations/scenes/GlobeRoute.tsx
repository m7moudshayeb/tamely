import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** A globe linked to a browser padlock. */
export function GlobeRoute({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <circle className={s.soft} cx="40" cy="40" r="20" />
      <g className={s.float}>
        <circle className={s.stroke} cx="40" cy="40" r="16" />
        <ellipse className={s.line} cx="40" cy="40" rx="7" ry="16" />
        <path className={s.line} d="M24 40h32M27 31h26M27 49h26" />
      </g>
      <path className={[s.line, s.flow].join(" ")} d="M60 38C74 22 86 22 98 30" />
      <circle className={[s.main, s.travel].join(" ")} style={t({ x: "36px" })} cx="61" cy="34" r="2.5" />
      <rect className={s.paper} x="98" y="18" width="46" height="42" rx="5" />
      <path className={s.line} d="M98 27h46" />
      <circle className={s.inset} cx="104" cy="22.5" r="1.5" /><circle className={s.inset} cx="109" cy="22.5" r="1.5" />
      <g className={s.pop}>
        <path className={s.stroke} d="M116 40v-4a5 5 0 0 1 10 0v4" />
        <rect className={s.main} x="113" y="39" width="16" height="12" rx="2.5" />
      </g>
    </Illustration>
  );
}

import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** Servers staying healthy. */
export function Uptime({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      {[14, 33, 52].map((y, i) => (
        <g key={y}>
          <rect className={s.paper} x="16" y={y} width="44" height="14" rx="3" />
          <path className={s.line} d={`M24 ${y + 7}h16`} />
          <circle className={[s.good, s.blink].join(" ")} style={t({ d: `${i * 0.5}s` })} cx="52" cy={y + 7} r="2.5" />
        </g>
      ))}
      <polyline className={[s.stroke, s.draw].join(" ")} points="70,40 88,40 96,22 106,58 114,32 120,40 148,40" />
    </Illustration>
  );
}

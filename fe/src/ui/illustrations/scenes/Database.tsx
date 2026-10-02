import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** Files being saved to storage. */
export function Database({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <rect className={[s.paper, s.drop].join(" ")} x="72" y="4" width="16" height="20" rx="2" />
      <rect className={[s.paper, s.drop].join(" ")} style={t({ d: "1.2s" })} x="96" y="6" width="14" height="18" rx="2" />
      {[56, 44, 32].map((y) => (
        <g key={y}>
          <path className={s.soft} d={`M60 ${y}v10c0 4 11 7 24 7s24-3 24-7V${y}`} />
          <ellipse className={s.main} cx="84" cy={y} rx="24" ry="6" opacity={y === 32 ? 1 : 0.55} />
        </g>
      ))}
      <circle className={[s.good, s.blink].join(" ")} cx="100" cy="62" r="2" />
    </Illustration>
  );
}

import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** Two offices joined by a private tunnel. */
export function Tunnel({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      {[12, 116].map((x) => (
        <g key={x}>
          <rect className={s.paper} x={x} y="20" width="32" height="44" rx="4" />
          <path className={s.line} d={`M${x + 8} 30h5M${x + 19} 30h5M${x + 8} 40h5M${x + 19} 40h5M${x + 8} 50h5M${x + 19} 50h5`} />
        </g>
      ))}
      <path className={s.soft} d="M44 40h72" style={{ stroke: "var(--main)", strokeWidth: 10, strokeLinecap: "round", opacity: 0.22 }} />
      <circle className={[s.main, s.travel].join(" ")} style={t({ x: "64px" })} cx="48" cy="40" r="2.5" />
      <circle className={[s.main, s.travel].join(" ")} style={t({ x: "64px", d: "1.2s" })} cx="48" cy="40" r="2.5" />
      <g className={s.float}>
        <path className={s.stroke} d="M75 36v-4a5 5 0 0 1 10 0v4" />
        <rect className={s.main} x="72" y="35" width="16" height="12" rx="2.5" />
      </g>
    </Illustration>
  );
}

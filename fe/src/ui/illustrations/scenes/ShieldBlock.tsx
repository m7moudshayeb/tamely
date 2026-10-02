import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** A shield stopping incoming attacks. */
export function ShieldBlock({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <circle className={[s.soft, s.pulse].join(" ")} cx="106" cy="40" r="24" />
      <circle className={[s.bad, s.hit].join(" ")} style={t({ x: "52px" })} cx="22" cy="28" r="3" />
      <circle className={[s.bad, s.hit].join(" ")} style={t({ x: "58px", d: "0.8s" })} cx="16" cy="42" r="3" />
      <circle className={[s.bad, s.hit].join(" ")} style={t({ x: "52px", d: "1.6s" })} cx="22" cy="55" r="3" />
      <g className={s.float}>
        <path className={s.main} d="M106 18l18 7v15c0 12-8 20-18 23-10-3-18-11-18-23V25z" />
        <path className={s.stroke} style={{ stroke: "var(--c-surface)" }} d="M98 40l5 5 10-11" />
      </g>
    </Illustration>
  );
}

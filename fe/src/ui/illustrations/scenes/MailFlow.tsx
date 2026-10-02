import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** A letter arriving in your inbox. */
export function MailFlow({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <path className={[s.line, s.flow].join(" ")} d="M16 46h96" />
      <g className={s.travel} style={t({ x: "70px", t: "2.8s" })}>
        <rect className={s.paper} x="18" y="30" width="30" height="20" rx="3" />
        <path className={s.line} d="M19 31l14 10 14-10" />
      </g>
      <path className={s.soft} d="M104 40h44v20a4 4 0 0 1-4 4h-36a4 4 0 0 1-4-4z" />
      <path className={s.stroke} d="M104 50h12l3 5h14l3-5h12" />
      <g className={s.pop} style={t({ d: "0.6s" })}>
        <circle className={s.good} cx="140" cy="24" r="8" />
        <path className={s.stroke} style={{ stroke: "var(--c-surface)" }} d="M136 24l3 3 5-6" />
      </g>
    </Illustration>
  );
}

import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** Photos, videos and sound. */
export function MediaPlay({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <rect className={s.paper} x="14" y="14" width="58" height="46" rx="5" />
      <circle className={[s.warn, s.pulse].join(" ")} cx="56" cy="26" r="6" />
      <circle className={s.warn} cx="56" cy="26" r="5" />
      <path className={s.main} d="M18 56l16-20 12 13 7-7 15 14z" />
      <g className={s.pop}>
        <circle className={s.main} cx="98" cy="40" r="14" />
        <path className={s.white} d="M94 33v14l12-7z" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className={[s.soft, s.grow].join(" ")} style={t({ d: `${i * 0.3}s` })} x={122 + i * 7} y={[30, 22, 34, 26][i]} width="4" height={[20, 36, 12, 28][i]} rx="2" />
      ))}
    </Illustration>
  );
}

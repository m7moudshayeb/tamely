import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** AI models connecting ideas. */
export function Neurons({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <path className={s.line} d="M30 22L80 16M30 22L80 40M30 22L80 64M30 58L80 16M30 58L80 40M30 58L80 64M80 16L130 40M80 40L130 40M80 64L130 40" />
      {[[30, 22], [30, 58], [80, 16], [80, 40], [80, 64]].map(([x, y], i) => (
        <g key={i}>
          <circle className={[s.soft, s.pulse].join(" ")} style={t({ d: `${i * 0.4}s` })} cx={x} cy={y} r="8" />
          <circle className={s.main} cx={x} cy={y} r="5" />
        </g>
      ))}
      <circle className={s.main} cx="130" cy="40" r="9" />
      <path className={[s.white, s.pop].join(" ")} d="M130 33l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    </Illustration>
  );
}

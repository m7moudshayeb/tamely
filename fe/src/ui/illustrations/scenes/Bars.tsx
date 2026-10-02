import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** A chart of your visitors. */
export function Bars({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <path className={s.line} d="M20 66h124" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} className={[i % 2 ? s.soft : s.main, s.grow].join(" ")} style={t({ d: `${i * 0.25}s` })} x={26 + i * 20} y={[38, 26, 44, 18, 30, 14][i]} width="12" height={[28, 40, 22, 48, 36, 52][i]} rx="3" />
      ))}
      <polyline className={[s.line, s.draw].join(" ")} points="32,30 52,20 72,36 92,12 112,24 132,8" />
    </Illustration>
  );
}

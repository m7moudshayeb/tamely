import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** Your team and alerts. */
export function Team({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      {[[44, "soft"], [100, "soft"], [72, "main"]].map(([x, c]) => (
        <g key={x as number} className={s.float} style={t({ d: `${(x as number) / 100}s` })}>
          <circle className={s[c as "main"]} cx={x as number} cy="32" r="10" />
          <path className={s[c as "main"]} d={`M${(x as number) - 17} 66a17 17 0 0 1 34 0z`} />
        </g>
      ))}
      <g className={s.swing}>
        <path className={s.warn} d="M136 10a8 8 0 0 0-8 8v7l-3 5h22l-3-5v-7a8 8 0 0 0-8-8z" />
        <circle className={s.warn} cx="136" cy="33" r="2.5" />
      </g>
      <circle className={[s.bad, s.pop].join(" ")} cx="143" cy="12" r="3.5" />
    </Illustration>
  );
}

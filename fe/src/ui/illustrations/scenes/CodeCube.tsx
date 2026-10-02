import type { TileColor } from "../../components/IconTile";
import { Illustration, s, t } from "../Illustration";

/** An app running on Cloudflare. */
export function CodeCube({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <g className={s.float}>
        <path className={s.main} d="M58 22l24-12 24 12-24 12z" />
        <path className={s.soft} d="M58 22v28l24 12V34z" />
        <path className={s.main} opacity="0.7" d="M106 22v28L82 62V34z" />
      </g>
      <g className={s.pop}>
        <rect className={s.paper} x="112" y="8" width="38" height="22" rx="6" />
        <path className={s.stroke} d="M124 14l-5 5 5 5M138 14l5 5-5 5M133 13l-4 12" />
      </g>
      <g className={s.pop} style={t({ d: "0.5s" })}>
        <circle className={s.warn} cx="26" cy="56" r="9" />
        <path className={s.white} d="M27 49l-5 8h4l-1 6 5-8h-4z" />
      </g>
    </Illustration>
  );
}

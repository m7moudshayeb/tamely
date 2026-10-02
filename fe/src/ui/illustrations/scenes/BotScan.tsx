import type { TileColor } from "../../components/IconTile";
import { Illustration, s } from "../Illustration";

/** An AI bot reading a page. */
export function BotScan({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <path className={s.line} d="M39 22v-8" /><circle className={[s.main, s.pop].join(" ")} cx="39" cy="12" r="3" />
      <g className={s.float}>
        <rect className={s.main} x="20" y="22" width="38" height="30" rx="9" />
        <circle className={[s.white, s.blink].join(" ")} cx="32" cy="36" r="4" />
        <circle className={[s.white, s.blink].join(" ")} cx="46" cy="36" r="4" />
        <rect className={s.white} x="32" y="45" width="14" height="2.5" rx="1.25" opacity="0.7" />
      </g>
      <path className={[s.line, s.flow].join(" ")} d="M62 37h28" />
      <rect className={s.paper} x="94" y="12" width="48" height="56" rx="5" />
      <path className={s.line} d="M102 24h32M102 32h26M102 40h32M102 48h20M102 56h28" />
      <rect className={[s.soft, s.scan].join(" ")} x="94" y="36" width="48" height="8" />
    </Illustration>
  );
}

import type { TileColor } from "../../components/IconTile";
import { Illustration, s } from "../Illustration";

/** A page loading quickly. */
export function FastPage({ color }: { color?: TileColor }) {
  return (
    <Illustration color={color}>
      <path className={[s.line, s.blink].join(" ")} d="M10 30h12M6 40h16M10 50h12" />
      <rect className={s.paper} x="30" y="14" width="86" height="52" rx="5" />
      <path className={s.line} d="M30 23h86" />
      <rect className={s.inset} x="40" y="30" width="40" height="4" rx="2" />
      <rect className={s.inset} x="40" y="38" width="58" height="4" rx="2" />
      <rect className={s.inset} x="40" y="52" width="66" height="5" rx="2.5" />
      <rect className={[s.main, s.fill].join(" ")} x="40" y="52" width="66" height="5" rx="2.5" />
      <path className={[s.main, s.pop].join(" ")} d="M138 16l-12 26h9l-4 22 14-30h-9l5-18z" />
    </Illustration>
  );
}

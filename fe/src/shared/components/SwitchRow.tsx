import { SWITCHES } from "@tamely/shared/copy";
import type { SwitchKey } from "@tamely/shared/types";
import { useAction } from "../hooks/useAction";
import { Badge, IconTile, ListRow, Switch, type IconName, type TileColor } from "@ui";

/** One safety/speed switch with its plain explanation. null means the token can't read it. */
export function SwitchRow({ zoneId, k, value, icon, color }: { zoneId: string; k: SwitchKey; value: boolean | null; icon: IconName; color: TileColor }) {
  const act = useAction();
  const s = SWITCHES[k];
  const pending = act.isPending ? (act.variables as { on: boolean } | undefined)?.on : undefined;
  const checked = pending ?? !!value;
  return (
    <ListRow
      leading={<IconTile icon={icon} color={color} size={18} />}
      title={<>{s.label} {s.risk === "careful" && <Badge tone="attention">Use with care</Badge>}</>}
      subtitle={value === null ? "Your token can't read this setting yet. See Setup & help." : checked ? s.on : s.off}
      trailing={
        <Switch
          label={s.label}
          checked={checked}
          disabled={value === null}
          busy={act.isPending}
          onChange={(on) => act.mutate({ kind: "set_switch", zoneId, key: k, on })}
        />
      }
    />
  );
}

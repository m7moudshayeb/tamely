import { SWITCH_KEYS, type ProtectionState, type SslMode, type SwitchKey, type Switches } from "@tamely/shared/types";
import { SETTING_SWITCHES } from "../../shared/constants/cloudflare";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";

interface BotManagement {
  ai_bots_protection?: string;
  fight_mode?: boolean;
}

const SSL_MODES: SslMode[] = ["off", "flexible", "full", "strict"];

export async function getProtection(cf: CfClient, zoneId: string): Promise<ProtectionState> {
  const switches = Object.fromEntries(SWITCH_KEYS.map((k) => [k, null])) as Switches;
  const [settings, bots] = await Promise.allSettled([
    cf.get<{ id: string; value: unknown }[]>(`/zones/${zoneId}/settings`),
    cf.get<BotManagement>(`/zones/${zoneId}/bot_management`),
  ]);
  let sslMode: SslMode = "unknown";
  if (settings.status === "fulfilled") {
    const v = (id: string) => settings.value.find((s) => s.id === id)?.value;
    for (const [key, def] of Object.entries(SETTING_SWITCHES)) {
      const value = v(def!.id);
      if (value !== undefined) switches[key as SwitchKey] = value === def!.onValue;
    }
    const ssl = String(v("ssl") || "");
    if ((SSL_MODES as string[]).includes(ssl)) sslMode = ssl as SslMode;
  }
  if (bots.status === "fulfilled") {
    switches.block_ai_bots = bots.value.ai_bots_protection === "block";
    switches.bot_fight = !!bots.value.fight_mode;
  }
  if (settings.status === "rejected" && bots.status === "rejected") throw settings.reason;
  return { switches, sslMode };
}

export async function setSwitch(cf: CfClient, zoneId: string, key: SwitchKey, on: boolean): Promise<void> {
  const def = SETTING_SWITCHES[key];
  if (def) {
    await cf.call("PATCH", `/zones/${zoneId}/settings/${def.id}`, { value: on ? def.onValue : def.offValue });
    return;
  }
  if (key === "block_ai_bots") {
    await cf.call("PUT", `/zones/${zoneId}/bot_management`, { ai_bots_protection: on ? "block" : "disabled" });
    return;
  }
  if (key === "bot_fight") {
    await cf.call("PUT", `/zones/${zoneId}/bot_management`, { fight_mode: on });
    return;
  }
  throw new AppError("Unknown switch.");
}

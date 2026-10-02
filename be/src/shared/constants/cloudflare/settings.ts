import type { SwitchKey } from "@tamely/shared/types";

export { SWITCHES } from "@tamely/shared/copy";

/** Zone setting ids behind simple on/off switches. */
export const SETTING_SWITCHES: Partial<Record<SwitchKey, { id: string; onValue: string; offValue: string }>> = {
  always_https: { id: "always_use_https", onValue: "on", offValue: "off" },
  under_attack: { id: "security_level", onValue: "under_attack", offValue: "medium" },
  dev_mode: { id: "development_mode", onValue: "on", offValue: "off" },
  email_obfuscation: { id: "email_obfuscation", onValue: "on", offValue: "off" },
  hotlink_protection: { id: "hotlink_protection", onValue: "on", offValue: "off" },
};

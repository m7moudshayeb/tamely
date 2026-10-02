export const SWITCH_KEYS = [
  "always_https",
  "under_attack",
  "dev_mode",
  "block_ai_bots",
  "bot_fight",
  "email_obfuscation",
  "hotlink_protection",
] as const;
export type SwitchKey = (typeof SWITCH_KEYS)[number];

/** null means the token can't read that setting. */
export type Switches = Record<SwitchKey, boolean | null>;

export type SslMode = "off" | "flexible" | "full" | "strict" | "unknown";

export interface ProtectionState {
  switches: Switches;
  sslMode: SslMode;
}

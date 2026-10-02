export interface AccountRef {
  id: string;
  name: string;
}

export interface SessionInfo {
  connected: boolean;
  account?: AccountRef;
  /** Present right after connecting when the token can see more than one account. */
  accounts?: AccountRef[];
  error?: string;
  /** How this browser signed in: a pasted key, or "Sign in with Cloudflare". */
  method?: "token" | "oauth";
}

/** One row of the onboarding checklist. */
export interface SetupCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  fix?: { label: string; href: string };
}

/** Plain messages for the codes the sign-in callback sends back in ?auth_error= */
export const AUTH_ERRORS: Record<string, string> = {
  denied: "You chose not to allow access. You can try again any time.",
  expired: "That sign-in took too long. Please try again.",
  no_account: "That Cloudflare login can't see any account. Pick an account on the consent screen and try again.",
  failed: "Cloudflare didn't finish the sign-in. Please try again.",
};

/** Where to cut Tamely off on every device. Tamely keeps nothing, so Cloudflare is the off switch. */
export const SIGN_OUT_EVERYWHERE = {
  token: {
    href: "https://dash.cloudflare.com/profile/api-tokens",
    step: "On the page that opens, find the key you made for Tamely and choose Delete.",
  },
  oauth: {
    href: "https://dash.cloudflare.com/?to=/profile/access-management/authorization",
    step: "On the page that opens, find Tamely and choose Revoke.",
  },
} as const;

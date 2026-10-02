export const SESSION_COOKIE = "tamely_session";
/** Sessions end after 7 days without use; each active day renews them. */
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7;
export const SESSION_IDLE_MS = SESSION_MAX_AGE_S * 1000;
export const SESSION_RENEW_AFTER_MS = 24 * 60 * 60 * 1000;
export const REFRESH_COOKIE = "tamely_refresh";
export const OAUTH_STATE_COOKIE = "tamely_oauth";
export const OAUTH_STATE_TTL_S = 10 * 60;
/** Refresh an OAuth access token this long before it expires. */
export const OAUTH_REFRESH_EARLY_MS = 60 * 1000;
export const PROPOSAL_TTL_MS = 15 * 60 * 1000;
export const MIN_SECRET_LENGTH = 32;

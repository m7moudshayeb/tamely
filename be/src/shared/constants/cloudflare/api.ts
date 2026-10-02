export const CF_API = "https://api.cloudflare.com/client/v4";
export const CF_TIMEOUT_MS = 20_000;
export const REDIRECT_PHASE = "http_request_dynamic_redirect";
export const SITES_PAGE_SIZE = 50;
export const DNS_PAGE_SIZE = 200;

/** Cloudflare error codes that mean "bad or missing token". */
export const BAD_TOKEN_CODES = [1000, 6003, 6111, 9106];
/** Cloudflare error codes that mean "token lacks permission". */
export const NO_PERMISSION_CODES = [10000, 9109, 7003];

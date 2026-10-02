import { TOKEN_PERMISSIONS } from "@tamely/shared/token";

/** One row per Cloudflare permission name, with the plain reason we need it. */
export const PERMISSION_ROWS = TOKEN_PERMISSIONS.filter((p, i, all) => all.findIndex((x) => x.cfName === p.cfName) === i).map((p) => ({
  name: p.cfName,
  access: TOKEN_PERMISSIONS.filter((x) => x.cfName === p.cfName).map((x) => x.type).join(" + "),
  why: p.why,
}));

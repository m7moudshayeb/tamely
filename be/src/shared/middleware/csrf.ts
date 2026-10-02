import type { MiddlewareHandler } from "hono";
import { MSG } from "../constants/copy";
import { CSRF_HEADER, CSRF_VALUE } from "../constants/http";
import { AppError } from "../lib/errors";

/** On top of SameSite=Strict: state-changing calls must come from our own page. */
export const csrf: MiddlewareHandler = async (c, next) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    const origin = c.req.header("Origin");
    const self = new URL(c.req.url).origin;
    if (c.req.header(CSRF_HEADER) !== CSRF_VALUE || (origin && origin !== self)) throw new AppError(MSG.blocked, 403, "csrf");
  }
  await next();
};

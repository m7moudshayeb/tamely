import type { MiddlewareHandler } from "hono";
import { MSG } from "../constants/copy";
import { AppError } from "../lib/errors";
import type { AppEnv, RateLimiter } from "../types/env";

const LOOPBACK = /^(127\.|::1$|::ffff:127\.)/;

/** Per-visitor limit using Cloudflare's rate limiter. Skipped for loopback (local runs), which real visitors never use. */
export const rateLimit = (pick: (env: AppEnv["Bindings"]) => RateLimiter | undefined, bucket: string): MiddlewareHandler<AppEnv> => async (c, next) => {
  const limiter = pick(c.env);
  const ip = c.req.header("CF-Connecting-IP");
  if (limiter && ip && !LOOPBACK.test(ip)) {
    const { success } = await limiter.limit({ key: `${bucket}:${ip}` });
    if (!success) throw new AppError(MSG.slowDown, 429, "rate_limited");
  }
  await next();
};

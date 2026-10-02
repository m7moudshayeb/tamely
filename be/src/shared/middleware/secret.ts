import type { MiddlewareHandler } from "hono";
import { MIN_SECRET_LENGTH } from "../constants/security";
import type { AppEnv } from "../types/env";

export const requireSecret: MiddlewareHandler<AppEnv> = async (c, next) => {
  const s = c.env.SESSION_SECRET;
  if (!s || s.length < MIN_SECRET_LENGTH) throw new Error("SESSION_SECRET is missing or shorter than 32 characters.");
  c.set("secret", s);
  await next();
};

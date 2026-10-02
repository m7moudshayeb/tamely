import type { ErrorHandler } from "hono";
import { MSG } from "../constants/copy";
import { AppError } from "../lib/errors";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    const status = err.status >= 400 && err.status < 600 ? err.status : 400;
    return c.json(err.toBody(), status as 400);
  }
  console.error("unexpected", err);
  return c.json({ error: MSG.serverBroke }, 500);
};

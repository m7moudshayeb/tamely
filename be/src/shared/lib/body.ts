import type { Context } from "hono";
import { MSG } from "../constants/copy";
import { AppError } from "./errors";

/** Parse a JSON body or fail with a friendly message. */
export async function readBody<T>(c: Context): Promise<Partial<T>> {
  try {
    const v = await c.req.json();
    if (!v || typeof v !== "object") throw new Error();
    return v as Partial<T>;
  } catch {
    throw new AppError(MSG.badRequest, 400);
  }
}

export const str = (v: unknown, max = 500): string => String(v ?? "").trim().slice(0, max);

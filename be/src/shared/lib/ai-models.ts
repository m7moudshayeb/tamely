import { DEFAULT_AI_FALLBACK_MODEL, DEFAULT_AI_MODEL } from "../constants/ai";
import type { Env } from "../types/env";

/** The person's chosen model first, then a fallback; duplicates removed. */
export const aiModels = (env: Env): string[] => [...new Set([env.AI_MODEL || DEFAULT_AI_MODEL, env.AI_FALLBACK_MODEL || DEFAULT_AI_FALLBACK_MODEL])];

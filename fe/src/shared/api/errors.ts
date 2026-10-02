import type { ApiError } from "@tamely/shared/types";

/** Normalized failure from the API, safe to show as-is. */
export class ApiFailure extends Error {
  constructor(message: string, public status = 0, public code?: string, public fix?: ApiError["fix"]) {
    super(message);
  }
}

export const SIGNED_OUT_EVENT = "tamely:signed-out";

import type { ApiError } from "@tamely/shared/types";

/** An error whose message is safe and friendly to show to the person. */
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code?: string,
    public fix?: ApiError["fix"],
  ) {
    super(message);
  }

  toBody(): ApiError {
    return { error: this.message, ...(this.code ? { code: this.code } : {}), ...(this.fix ? { fix: this.fix } : {}) };
  }
}

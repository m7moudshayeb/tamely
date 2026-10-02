import { BAD_TOKEN_CODES, CF_API, CF_TIMEOUT_MS, NO_PERMISSION_CODES } from "../constants/cloudflare";
import { MSG } from "../constants/copy";
import { AppError } from "./errors";

interface CfEnvelope<T> {
  success: boolean;
  errors?: { code: number; message: string }[];
  result: T;
}

/** Only localhost overrides are honored, so a misconfigured var can never leak tokens. */
export function resolveApiBase(override?: string): string {
  if (override && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(override)) return override.replace(/\/$/, "");
  return CF_API;
}

function friendly(status: number, errors: { code: number; message: string }[] = []): AppError {
  const detail = errors.map((e) => e.message).join(" ");
  const codes = errors.map((e) => e.code);
  if (codes.some((c) => BAD_TOKEN_CODES.includes(c)) || /invalid (api|access) token/i.test(detail)) {
    return new AppError(MSG.tokenRejected, 401, "token_rejected");
  }
  if (status === 401 || status === 403 || codes.some((c) => NO_PERMISSION_CODES.includes(c))) {
    return new AppError(status === 403 && !codes.some((c) => NO_PERMISSION_CODES.includes(c)) ? MSG.notAllowed : MSG.noPermission, 403, "no_permission");
  }
  if (status === 429) return new AppError(MSG.rateLimited, 429, "rate_limited");
  if (status === 404) return new AppError(detail || MSG.notFound, 404, "not_found");
  return new AppError(detail || "Cloudflare refused the request.", 400, "cloudflare");
}

/** Thin Cloudflare API client. Every feature goes through it. */
export class CfClient {
  readonly base: string;

  constructor(private token: string, baseOverride?: string) {
    this.base = resolveApiBase(baseOverride);
  }

  /** Raw call for endpoints that don't use Cloudflare's envelope (e.g. AI's OpenAI format). */
  async raw(method: string, path: string, body?: unknown, timeoutMs = CF_TIMEOUT_MS): Promise<{ status: number; json: unknown }> {
    let res: Response;
    try {
      res = await fetch(this.base + path, {
        method,
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new AppError(MSG.offline, 502, "offline");
    }
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  }

  async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const { status, json } = await this.raw(method, path, body);
    const env = json as CfEnvelope<T> | null;
    if (!env || typeof env !== "object") throw new AppError(MSG.unreadable, 502, "unreadable");
    if (status >= 400 || !env.success) throw friendly(status, env.errors);
    return env.result;
  }

  get<T>(path: string): Promise<T> {
    return this.call<T>("GET", path);
  }

  async graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const { status, json } = await this.raw("POST", "/graphql", { query, variables });
    const res = json as { data?: T; errors?: { message: string }[] | null } | null;
    if (status === 401 || status === 403) throw friendly(status);
    if (!res || res.errors?.length || !res.data) {
      const msg = res?.errors?.[0]?.message || "";
      if (/not authorized|permission|access/i.test(msg)) throw new AppError(MSG.noPermission, 403, "no_permission");
      throw new AppError("Visitor numbers aren't available right now.", 502, "analytics");
    }
    return res.data;
  }
}

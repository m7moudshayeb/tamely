const CF_API = "https://api.cloudflare.com/client/v4";

/** Tests point this at a local mock; anything else always goes to Cloudflare. */
const base = () => {
  const o = process.env.CF_API_BASE;
  return o && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(o) ? o.replace(/\/$/, "") : CF_API;
};

interface Envelope<T> { success: boolean; errors?: { code: number; message: string }[]; result: T }

async function call<T>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(base() + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !json?.success) {
    const why = json?.errors?.map((e) => e.message).join(" ") || `HTTP ${res.status}`;
    throw new Error(why);
  }
  return json.result;
}

export const listAccounts = (token: string) => call<{ id: string; name: string }[]>(token, "GET", "/accounts?per_page=50");

export interface NewClient {
  client_name: string;
  response_types: string[];
  grant_types: string[];
  token_endpoint_auth_method: string;
  redirect_uris: string[];
  client_uri: string;
  scopes: string[];
}

/** Field names differ between API versions, so accept either spelling. */
export async function createClient(token: string, accountId: string, body: NewClient): Promise<{ id: string; secret: string }> {
  const r = await call<Record<string, unknown>>(token, "POST", `/accounts/${accountId}/oauth_clients`, body);
  const id = String(r.client_id ?? r.id ?? "");
  const secret = String(r.client_secret ?? r.secret ?? "");
  if (!id || !secret) throw new Error("Cloudflare created the client but didn't return its id and secret. Open OAuth clients on the dashboard to copy them.");
  return { id, secret };
}

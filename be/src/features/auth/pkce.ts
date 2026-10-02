import { toB64url } from "../../shared/lib/base64url";

/** PKCE S256 pair plus an unguessable state value. */
export async function pkcePair(): Promise<{ verifier: string; challenge: string; state: string }> {
  const verifier = toB64url(crypto.getRandomValues(new Uint8Array(48)));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  return { verifier, challenge: toB64url(digest), state: toB64url(crypto.getRandomValues(new Uint8Array(24))) };
}

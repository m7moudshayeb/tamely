// AES-GCM sealing for the session cookie, HMAC signing for proposals.
// Keys are derived from SESSION_SECRET with distinct labels.
import { fromB64url, toB64url } from "./base64url";

const enc = new TextEncoder();
const dec = new TextDecoder();

async function aesKey(secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode("enc:" + secret));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode("mac:" + secret));
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function seal(value: unknown, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secret), enc.encode(JSON.stringify(value))));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return toB64url(out);
}

export async function unseal<T>(sealed: string, secret: string): Promise<T | null> {
  try {
    const raw = fromB64url(sealed);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12) }, await aesKey(secret), raw.slice(12));
    return JSON.parse(dec.decode(pt)) as T;
  } catch {
    return null;
  }
}

export async function sign(payload: unknown, secret: string): Promise<string> {
  const body = toB64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body)));
  return `${body}.${toB64url(sig)}`;
}

export async function verify<T>(signed: string, secret: string): Promise<T | null> {
  const [body, sig] = String(signed || "").split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), fromB64url(sig), enc.encode(body));
    return ok ? (JSON.parse(dec.decode(fromB64url(body))) as T) : null;
  } catch {
    return null;
  }
}

export const randomId = (): string => toB64url(crypto.getRandomValues(new Uint8Array(9)));

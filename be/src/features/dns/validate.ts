import { DNS_TYPES, type DnsType, type NewDnsRecord } from "@tamely/shared/types";
import { HOSTNAME, IPV4, IPV6, RECORD_NAME } from "../../shared/constants/security";
import { AppError } from "../../shared/lib/errors";

/** Validates a new record before it reaches Cloudflare. Errors are written for non-technical people. */
export function validateDns(input: Partial<NewDnsRecord> | undefined): NewDnsRecord {
  const r = input || {};
  const type = String(r.type || "").toUpperCase() as DnsType;
  const name = String(r.name || "").trim().toLowerCase();
  const content = String(r.content || "").trim();
  if (!DNS_TYPES.includes(type)) throw new AppError("Choose what the record should do.");
  if (!name) throw new AppError("Add a name. Use @ for the main domain.");
  if (!RECORD_NAME.test(name)) throw new AppError("Use letters, numbers and dashes for the name, like www or shop. Use @ for the main domain.");
  if (!content) throw new AppError("Add where the record should point.");
  if (content.length > 2048) throw new AppError("That value is too long.");
  if (type === "A" && !IPV4.test(content)) throw new AppError("That isn't a valid server address. It should look like 203.0.113.10.");
  if (type === "AAAA" && !(content.includes(":") && IPV6.test(content))) throw new AppError("That isn't a valid IPv6 address.");
  if ((type === "CNAME" || type === "MX") && !HOSTNAME.test(content)) throw new AppError("That should be a domain name, like myapp.example.com.");
  const out: NewDnsRecord = { type, name, content };
  if (type === "A" || type === "AAAA" || type === "CNAME") out.proxied = r.proxied !== false;
  if (type === "MX") {
    const p = Number(r.priority ?? 10);
    if (!Number.isInteger(p) || p < 0 || p > 65535) throw new AppError("Priority must be a whole number, like 10.");
    out.priority = p;
  }
  return out;
}

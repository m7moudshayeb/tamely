import type { DnsType } from "@tamely/shared/types";
import type { IconName } from "@ui";

interface Field { key: "name" | "content" | "priority"; label: string; placeholder: string; hint: string }

/** Each record type in plain words, and only the fields that type needs. */
export const RECORD_TYPES: Record<DnsType, { label: string; description: string; icon: IconName; fields: Field[]; proxiable: boolean }> = {
  CNAME: {
    label: "Point to a service",
    description: "Vercel, Netlify, Shopify, Webflow…",
    icon: "link",
    proxiable: true,
    fields: [
      { key: "name", label: "Address", placeholder: "www", hint: "The part before your domain, like www or shop. Use @ for the main domain." },
      { key: "content", label: "Points to", placeholder: "cname.vercel-dns.com", hint: "Your provider shows you this value." },
    ],
  },
  A: {
    label: "Point to a server",
    description: "Your server's IP address",
    icon: "server",
    proxiable: true,
    fields: [
      { key: "name", label: "Address", placeholder: "@", hint: "Use @ for the main domain, or a word like www." },
      { key: "content", label: "Server IP address", placeholder: "203.0.113.10", hint: "Four numbers separated by dots." },
    ],
  },
  AAAA: {
    label: "Point to a server (IPv6)",
    description: "A newer kind of server address",
    icon: "server",
    proxiable: true,
    fields: [
      { key: "name", label: "Address", placeholder: "@", hint: "Use @ for the main domain." },
      { key: "content", label: "IPv6 address", placeholder: "2001:db8::1", hint: "Your host gives you this." },
    ],
  },
  MX: {
    label: "Receive email",
    description: "From Google Workspace, Zoho, Proton…",
    icon: "envelope",
    proxiable: false,
    fields: [
      { key: "name", label: "Address", placeholder: "@", hint: "Usually @ for the main domain." },
      { key: "content", label: "Mail server", placeholder: "smtp.google.com", hint: "From your email provider." },
      { key: "priority", label: "Priority", placeholder: "10", hint: "Lower numbers are tried first." },
    ],
  },
  TXT: {
    label: "Prove you own it",
    description: "Google, Stripe, email settings…",
    icon: "doc",
    proxiable: false,
    fields: [
      { key: "name", label: "Address", placeholder: "@", hint: "Usually @ unless the service says otherwise." },
      { key: "content", label: "Text", placeholder: "google-site-verification=…", hint: "Paste exactly what the service gave you." },
    ],
  },
};

export const PRESETS: { id: string; label: string; type: DnsType; name: string; content: string; proxied: boolean }[] = [
  { id: "vercel", label: "Vercel website", type: "CNAME", name: "www", content: "cname.vercel-dns.com", proxied: false },
  { id: "shopify", label: "Shopify store", type: "CNAME", name: "www", content: "shops.myshopify.com", proxied: false },
  { id: "github", label: "GitHub Pages", type: "CNAME", name: "www", content: "", proxied: false },
  { id: "google-mx", label: "Google Workspace email", type: "MX", name: "@", content: "smtp.google.com", proxied: false },
];

/** One plain sentence describing what a record does. */
export function describeRecord(type: string, content: string, priority?: number): string {
  switch (type) {
    case "A":
    case "AAAA": return `Goes to the server at ${content}`;
    case "CNAME": return `Goes to ${content}`;
    case "MX": return `Receives email through ${content}${priority !== undefined ? ` (priority ${priority})` : ""}`;
    case "TXT": return `Note: ${content.length > 60 ? content.slice(0, 60) + "…" : content}`;
    default: return `${type} · ${content}`;
  }
}

export const typeIcon = (type: string): IconName => (RECORD_TYPES as Record<string, { icon: IconName }>)[type]?.icon || "doc";

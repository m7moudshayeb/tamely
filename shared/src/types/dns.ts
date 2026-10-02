export const DNS_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT"] as const;
export type DnsType = (typeof DNS_TYPES)[number];

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  proxiable: boolean;
  priority?: number;
  locked: boolean;
  comment?: string;
}

export interface NewDnsRecord {
  type: DnsType;
  name: string;
  content: string;
  proxied?: boolean;
  priority?: number;
}

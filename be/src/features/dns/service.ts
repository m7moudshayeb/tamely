import type { DnsRecord, NewDnsRecord } from "@tamely/shared/types";
import { DNS_PAGE_SIZE } from "../../shared/constants/cloudflare";
import { RECORD_ID } from "../../shared/constants/security";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";
import { validateDns } from "./validate";

interface CfRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  proxiable?: boolean;
  priority?: number;
  comment?: string | null;
  meta?: { read_only?: boolean };
}

export async function listDns(cf: CfClient, zoneId: string): Promise<DnsRecord[]> {
  const rows = await cf.get<CfRecord[]>(`/zones/${zoneId}/dns_records?per_page=${DNS_PAGE_SIZE}`);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    content: r.content,
    proxied: !!r.proxied,
    proxiable: !!r.proxiable,
    priority: r.priority,
    locked: !!r.meta?.read_only,
    comment: r.comment || undefined,
  }));
}

export async function addDns(cf: CfClient, zoneId: string, input: NewDnsRecord): Promise<void> {
  await cf.call("POST", `/zones/${zoneId}/dns_records`, { ...validateDns(input), ttl: 1 });
}

export async function deleteDns(cf: CfClient, zoneId: string, recordId: string): Promise<void> {
  if (!RECORD_ID.test(recordId)) throw new AppError("Unknown record.");
  await cf.call("DELETE", `/zones/${zoneId}/dns_records/${recordId}`);
}

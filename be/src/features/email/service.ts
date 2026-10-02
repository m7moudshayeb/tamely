import type { EmailInfo } from "@tamely/shared/types";
import { EMAIL, EMAIL_LOCAL, RULE_ID } from "../../shared/constants/security";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";

interface CfRule {
  id?: string;
  tag?: string;
  enabled: boolean;
  matchers: { type: string; field?: string; value?: string }[];
  actions: { type: string; value?: string[] }[];
}

export async function getEmail(cf: CfClient, zoneId: string): Promise<EmailInfo> {
  const settings = await cf.get<{ enabled: boolean }>(`/zones/${zoneId}/email/routing`);
  let forwards: EmailInfo["forwards"] = [];
  try {
    const rules = await cf.get<CfRule[]>(`/zones/${zoneId}/email/routing/rules?per_page=50`);
    forwards = rules
      .filter((r) => r.matchers.some((m) => m.type === "literal") && r.actions.some((a) => a.type === "forward"))
      .map((r) => ({
        id: r.id || r.tag || "",
        from: r.matchers.find((m) => m.type === "literal")?.value || "",
        to: (r.actions.find((a) => a.type === "forward")?.value || []).join(", "),
        enabled: r.enabled,
      }));
  } catch {
    /* Rules can't be listed until forwarding is turned on. */
  }
  return { enabled: !!settings.enabled, forwards };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function normalizeForward(siteName: string, from: string, to: string): { local: string; dest: string } {
  const local = String(from || "").trim().toLowerCase().replace(new RegExp(`@${escapeRe(siteName)}$`), "");
  const dest = String(to || "").trim().toLowerCase();
  if (!EMAIL_LOCAL.test(local)) throw new AppError("Use a simple address name, like hello or support.");
  if (!EMAIL.test(dest)) throw new AppError("Enter the inbox to forward to, like you@gmail.com.");
  if (dest.endsWith(`@${siteName}`)) throw new AppError("Forward to an inbox outside this domain, like you@gmail.com.");
  return { local, dest };
}

export async function addForward(cf: CfClient, siteName: string, zoneId: string, accountId: string, from: string, to: string): Promise<{ needsVerify: boolean }> {
  const { local, dest } = normalizeForward(siteName, from, to);
  const status = await cf.get<{ enabled: boolean }>(`/zones/${zoneId}/email/routing`);
  if (!status.enabled) await cf.call("POST", `/zones/${zoneId}/email/routing/dns`, { name: siteName });
  const addresses = await cf.get<{ email: string; verified: string | null }[]>(`/accounts/${accountId}/email/routing/addresses?per_page=50`);
  const existing = addresses.find((a) => a.email.toLowerCase() === dest);
  if (!existing) await cf.call("POST", `/accounts/${accountId}/email/routing/addresses`, { email: dest });
  await cf.call("POST", `/zones/${zoneId}/email/routing/rules`, {
    name: `${local}@${siteName} to ${dest}`,
    enabled: true,
    matchers: [{ type: "literal", field: "to", value: `${local}@${siteName}` }],
    actions: [{ type: "forward", value: [dest] }],
  });
  return { needsVerify: !existing?.verified };
}

export async function deleteForward(cf: CfClient, zoneId: string, ruleId: string): Promise<void> {
  if (!RULE_ID.test(ruleId)) throw new AppError("Unknown forwarding address.");
  await cf.call("DELETE", `/zones/${zoneId}/email/routing/rules/${ruleId}`);
}

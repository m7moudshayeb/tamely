import type { Redirect } from "@tamely/shared/types";
import { REDIRECT_PHASE } from "../../shared/constants/cloudflare";
import { HTTP_URL, RECORD_ID, URL_PATH } from "../../shared/constants/security";
import type { CfClient } from "../../shared/lib/cf-client";
import { AppError } from "../../shared/lib/errors";

interface CfRuleset {
  id: string;
  rules?: {
    id: string;
    expression: string;
    description?: string;
    enabled: boolean;
    action: string;
    action_parameters?: { from_value?: { status_code?: number; target_url?: { value?: string; expression?: string } } };
  }[];
}

async function entrypoint(cf: CfClient, zoneId: string): Promise<CfRuleset | null> {
  try {
    return await cf.get<CfRuleset>(`/zones/${zoneId}/rulesets/phases/${REDIRECT_PHASE}/entrypoint`);
  } catch (e) {
    if (e instanceof AppError && e.status === 404) return null;
    throw e;
  }
}

export async function listRedirects(cf: CfClient, zoneId: string): Promise<Redirect[]> {
  const rs = await entrypoint(cf, zoneId);
  if (!rs) return [];
  return (rs.rules || [])
    .filter((r) => r.action === "redirect")
    .map((r) => {
      const path = r.expression.match(/http\.request\.uri\.path eq "([^"]*)"/)?.[1];
      const t = r.action_parameters?.from_value?.target_url;
      return {
        rulesetId: rs.id,
        id: r.id,
        from: path || r.description || r.expression,
        to: t?.value || t?.expression || "",
        permanent: r.action_parameters?.from_value?.status_code !== 302,
        enabled: r.enabled,
      };
    });
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Paths and targets are strictly validated so nothing can be injected into the rule expression. */
export function normalizeRedirect(siteName: string, from: string, to: string): { path: string; target: string } {
  let path = String(from || "").trim().replace(new RegExp(`^https?://(www\\.)?${escapeRe(siteName)}`, "i"), "");
  if (!path.startsWith("/")) path = "/" + path;
  if (!URL_PATH.test(path) || path.length > 512) throw new AppError("The old link should be a page on your site, like /pricing.");
  const target = String(to || "").trim();
  if (!HTTP_URL.test(target) || target.length > 2048) throw new AppError("The new link must be a full address, like https://example.com/new.");
  return { path, target };
}

export async function addRedirect(cf: CfClient, siteName: string, zoneId: string, from: string, to: string, permanent = true): Promise<void> {
  const { path, target } = normalizeRedirect(siteName, from, to);
  const rule = {
    action: "redirect",
    description: `${path} to ${target}`,
    enabled: true,
    expression: `(http.host eq "${siteName}" and http.request.uri.path eq "${path}")`,
    action_parameters: { from_value: { status_code: permanent ? 301 : 302, target_url: { value: target }, preserve_query_string: true } },
  };
  const rs = await entrypoint(cf, zoneId);
  if (rs) await cf.call("POST", `/zones/${zoneId}/rulesets/${rs.id}/rules`, rule);
  else await cf.call("PUT", `/zones/${zoneId}/rulesets/phases/${REDIRECT_PHASE}/entrypoint`, { rules: [rule] });
}

export async function deleteRedirect(cf: CfClient, zoneId: string, rulesetId: string, ruleId: string): Promise<void> {
  if (!RECORD_ID.test(rulesetId) || !RECORD_ID.test(ruleId)) throw new AppError("Unknown redirect.");
  await cf.call("DELETE", `/zones/${zoneId}/rulesets/${rulesetId}/rules/${ruleId}`);
}

import type {
  Action, ActionResult, Briefing, DnsRecord, EmailInfo, ProtectionState, Range, Redirect, SessionInfo, SetupCheck, Site, Traffic, Guide,
} from "@tamely/shared/types";
import { API } from "../constants/api";
import { del, get, post, put } from "./http";

export interface AppInfo { name: string; updated: string }

export const api = {
  session: () => get<SessionInfo>(API.session),
  connect: (token: string) => post<SessionInfo>(API.session, { token }),
  switchAccount: (accountId: string) => put<SessionInfo>(API.sessionAccount, { accountId }),
  disconnect: () => del<SessionInfo>(API.session),
  sites: () => get<{ sites: Site[] }>(API.sites).then((r) => r.sites),
  dns: (z: string) => get<{ records: DnsRecord[] }>(API.site(z, "dns")).then((r) => r.records),
  email: (z: string) => get<EmailInfo>(API.site(z, "email")),
  redirects: (z: string) => get<{ redirects: Redirect[] }>(API.site(z, "redirects")).then((r) => r.redirects),
  protection: (z: string) => get<ProtectionState>(API.site(z, "protection")),
  analytics: (z: string, range: Range) => get<Traffic>(API.site(z, "analytics"), { range }),
  briefing: (z: string) => get<Briefing>(API.site(z, "briefing")),
  apps: () => get<{ apps: AppInfo[] }>(API.apps).then((r) => r.apps),
  guide: (pageId: string, zoneId: string | null) => get<Guide>(API.guide(pageId), zoneId ? { zoneId } : undefined),
  act: (a: Action) => post<ActionResult>(API.actions, a),
  confirm: (token: string) => post<ActionResult>(API.confirm, { token }),
  checks: () => get<{ checks: SetupCheck[] }>(API.checks).then((r) => r.checks),
  authConfig: () => get<{ cloudflareSignIn: boolean }>(API.authConfig),
};

export type SiteStatus = "active" | "pending" | "initializing" | "moved" | "deleted" | "deactivated" | string;

export interface Site {
  id: string;
  name: string;
  status: SiteStatus;
  plan: string;
  nameServers: string[];
}

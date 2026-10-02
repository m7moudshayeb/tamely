import type { CatalogGroup } from "./types";

export const CATALOG_GROUPS: CatalogGroup[] = [
  { id: "address", title: "Your address", icon: "globe", blurb: "Domains, DNS and the padlock" },
  { id: "protection", title: "Protection", icon: "shield", blurb: "Attacks, bots and logins" },
  { id: "speed", title: "Speed", icon: "bolt", blurb: "Saved copies and faster pages" },
  { id: "links", title: "Links & pages", icon: "signpost", blurb: "Redirects, rules and error pages" },
  { id: "email", title: "Email", icon: "envelope", blurb: "Forwarding and anti-spoofing" },
  { id: "ai", title: "AI & bots", icon: "sparkles", blurb: "Which AI crawlers visit you" },
  { id: "traffic", title: "Traffic & uptime", icon: "waveform", blurb: "Load balancing and health checks" },
  { id: "insights", title: "Visitors & logs", icon: "chart", blurb: "Numbers, charts and raw logs" },
  { id: "apps", title: "Apps & code", icon: "cube", blurb: "Websites and apps you deploy" },
  { id: "ai_build", title: "AI building blocks", icon: "brain", blurb: "Models and AI tools for your apps" },
  { id: "data", title: "Data & files", icon: "tray", blurb: "Storage and databases" },
  { id: "media", title: "Images, video & calls", icon: "photo", blurb: "Media hosting and real-time" },
  { id: "network", title: "Networks", icon: "network", blurb: "Tunnels and private networks" },
  { id: "account", title: "Your account", icon: "person", blurb: "Team, billing and alerts" },
];

import type { CatalogPage } from "@tamely/shared/catalog";
import type { IconName, SceneName, TileColor } from "@ui";

/** Each topic gets an animated scene, a colour and a one-line "what is this for". */
export const GROUP_ART: Record<string, { color: TileColor; icon: IconName; scene: SceneName; plain: string }> = {
  address: { color: "teal", icon: "globe", scene: "GlobeRoute", plain: "Where your website lives and the padlock in the browser" },
  protection: { color: "green", icon: "shield", scene: "ShieldBlock", plain: "Keep attackers, spam and bad bots out" },
  speed: { color: "yellow", icon: "bolt", scene: "FastPage", plain: "Make pages load faster for everyone" },
  links: { color: "purple", icon: "signpost", scene: "Signpost", plain: "Send visitors to the right page" },
  email: { color: "blue", icon: "envelope", scene: "MailFlow", plain: "Email at your own domain" },
  ai: { color: "pink", icon: "sparkles", scene: "BotScan", plain: "Decide what AI companies may read" },
  traffic: { color: "teal", icon: "waveform", scene: "Uptime", plain: "Stay online when it gets busy" },
  insights: { color: "blue", icon: "chart", scene: "Bars", plain: "See who visits and what happened" },
  apps: { color: "pink", icon: "cube", scene: "CodeCube", plain: "Websites and apps you run on Cloudflare" },
  ai_build: { color: "purple", icon: "brain", scene: "Neurons", plain: "AI tools for builders" },
  data: { color: "graphite", icon: "tray", scene: "Database", plain: "Store files and data" },
  media: { color: "red", icon: "photo", scene: "MediaPlay", plain: "Images, videos and calls" },
  network: { color: "graphite", icon: "network", scene: "Tunnel", plain: "Connect offices and private servers" },
  account: { color: "brand", icon: "person", scene: "Team", plain: "Your team, bills and alerts" },
};

const PAGE_ICONS: [RegExp, IconName][] = [
  [/dns|domains/, "globe"], [/ssl/, "lock"], [/access|zero-trust|api-tokens|secrets/, "key"], [/turnstile|abuse/, "person"],
  [/sec-|waf|bot|threat|infra|investigate/, "shield"], [/cache/, "tray"], [/observatory|speed|rum|synthetic|smart|argo/, "bolt"],
  [/redirect|rules|routes|snippets|connector/, "signpost"], [/error/, "exclamation"], [/email|dmarc/, "envelope"],
  [/ai-|monetize/, "sparkles"], [/agent|webmcp|models|workers-ai|vectorize|ai-search|ai-gateway/, "brain"],
  [/health|load|waiting|network|web3/, "waveform"], [/analytics|traffic|dashboard|performance/, "chart"], [/log/, "doc"],
  [/workers|containers|durable|queues|workflows|browser|vpc|plans|flagship|wfp|observ/, "cube"],
  [/r2|kv|d1|hyperdrive|pipelines|engine/, "tray"], [/img|stream|realtime|turn|sfu/, "photo"], [/tunnel|mesh|net-|ip-/, "network"],
  [/members/, "person2"], [/billing/, "doc"], [/alerts/, "info"], [/audit/, "clock"],
];

export const pageIcon = (p: CatalogPage): IconName => PAGE_ICONS.find(([re]) => re.test(p.id))?.[1] || GROUP_ART[p.group]?.icon || "compass";

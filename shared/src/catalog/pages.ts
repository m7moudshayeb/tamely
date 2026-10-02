import { APP_ROUTES } from "../routes";
import type { CatalogPage, CatalogScope } from "./types";

const D = "https://developers.cloudflare.com";

type Row = [id: string, title: string, cfName: string, summary: string, path: string, docs: string, appRoute?: string, keywords?: string[]];

const build = (group: string, scope: CatalogScope, rows: Row[]): CatalogPage[] =>
  rows.map(([id, title, cfName, summary, path, docs, appRoute, keywords]) => ({
    id, group, title, cfName, summary, scope, path, docs: D + docs, appRoute, keywords,
  }));

/** Every page of the Cloudflare dashboard, renamed in plain words. Paths checked against the live dashboard. */
export const CATALOG_PAGES: CatalogPage[] = [
  ...build("address", "zone", [
    ["dns-records", "Address records", "DNS › Records", "Point your domain at servers, apps and email", "/dns/records", "/dns/manage-dns-records/", APP_ROUTES.address, ["dns", "a record", "cname", "mx", "txt", "point domain", "vercel", "netlify", "shopify"]],
    ["dns-analytics", "Address lookups", "DNS › Analytics", "How often your domain is looked up", "/dns/analytics", "/dns/additional-options/analytics/"],
    ["dns-settings", "Address settings", "DNS › Settings", "DNSSEC, nameservers and other options", "/dns/settings", "/dns/dnssec/", undefined, ["dnssec", "nameservers"]],
    ["ssl-overview", "Secure padlock (https)", "SSL/TLS › Overview", "How encryption is set up for your website", "/ssl-tls", "/ssl/origin-configuration/ssl-modes/", APP_ROUTES.protection, ["ssl", "tls", "https", "padlock", "flexible", "full", "strict"]],
    ["ssl-edge", "Visitor certificates", "SSL/TLS › Edge Certificates", "Certificates visitors see, plus always-https", "/ssl-tls/edge-certificates", "/ssl/edge-certificates/", undefined, ["certificate", "always use https", "hsts"]],
    ["ssl-client", "Device certificates", "SSL/TLS › Client Certificates", "Require devices to show a certificate", "/ssl-tls/client-certificates", "/ssl/client-certificates/", undefined, ["mtls"]],
    ["ssl-origin", "Server certificates", "SSL/TLS › Origin Server", "Free certificates for your own server", "/ssl-tls/origin", "/ssl/origin-configuration/origin-ca/"],
    ["ssl-custom-hostnames", "Customer domains", "SSL/TLS › Custom Hostnames", "Let your customers use their own domains", "/ssl-tls/custom-hostnames", "/cloudflare-for-platforms/cloudflare-for-saas/", undefined, ["saas", "custom domain"]],
  ]),
  ...build("address", "account", [
    ["domains", "All my domains", "Domains › Overview", "Every domain on your account", "/domains/overview", "/fundamentals/manage-domains/"],
    ["domains-register", "Buy a domain", "Domains › Registrations", "Register a new domain at cost price", "/domains/registrations", "/registrar/get-started/register-domain/", undefined, ["register", "buy domain", "registrar"]],
    ["domains-transfer", "Move a domain here", "Domains › Transfers", "Transfer a domain from another registrar", "/domains/transfers", "/registrar/get-started/transfer-domain-to-cloudflare/", undefined, ["transfer", "godaddy", "namecheap"]],
  ]),
  ...build("protection", "zone", [
    ["sec-overview", "Security overview", "Security › Overview", "What's being blocked, and what to fix", "/security/overview", "/waf/", APP_ROUTES.protection],
    ["sec-analytics", "Security stats", "Security › Analytics", "Attacks and suspicious traffic over time", "/security/analytics", "/waf/analytics/security-analytics/"],
    ["sec-abuse", "Fake signup protection", "Security › Account Abuse Protection", "Stop fake signups, spam accounts and takeovers", "/security/account-abuse-protection", "/waf/detections/leaked-credentials/", undefined, ["leaked credentials", "signup spam"]],
    ["sec-assets", "Pages & APIs found", "Security › Web assets", "Endpoints discovered on your website", "/security/web-assets", "/api-shield/"],
    ["sec-rules", "Block & allow rules", "Security › Security rules", "Block countries or IPs, limit request rates", "/security/security-rules", "/waf/custom-rules/", undefined, ["block country", "block ip", "rate limit", "firewall rule"]],
    ["sec-settings", "Security settings", "Security › Settings", "Bot fight mode, security level and more", "/security/settings", "/bots/get-started/bot-fight-mode/", APP_ROUTES.protection, ["bot fight mode", "under attack", "security level", "hotlink"]],
    ["access", "Login gate", "Access", "Put a login in front of any page", "/access", "/cloudflare-one/access-controls/applications/http-apps/", undefined, ["password protect", "login", "zero trust"]],
  ]),
  ...build("protection", "account", [
    ["sec-insights", "Security check-up", "Application security › Security insights", "Issues across all your websites", "/security-center", "/security/security-insights/"],
    ["waf", "Firewall", "Application security › WAF", "Ready-made and custom rules against attacks", "/application-security/waf", "/waf/managed-rules/", undefined, ["waf", "firewall"]],
    ["botbase", "Bot management", "Application security › BotBase", "Tell good bots from bad ones", "/application-security/botbase", "/bots/"],
    ["turnstile", "Human check for forms", "Application security › Turnstile", "Stop form spam with a friendly CAPTCHA replacement", "/turnstile", "/turnstile/", undefined, ["captcha", "form spam"]],
    ["investigate", "Threat lookup", "Application security › Investigate", "Look up an IP, domain or file", "/application-security/investigate", "/security-center/investigate/"],
    ["threat-intel", "Threat intelligence", "Application security › Threat intelligence", "Follow active attack campaigns", "/application-security/threat-intelligence", "/security-center/cloudforce-one/"],
    ["infra", "Server protection", "Application security › Infrastructure", "Protect your servers and network", "/security-center/inventory", "/security-center/"],
    ["zero-trust", "Team access (Zero Trust)", "Zero Trust", "Secure how your team reaches apps", "/zero-trust/landing-page", "/cloudflare-one/"],
  ]),
  ...build("speed", "zone", [
    ["observatory", "Speed test", "Speed › Observatory", "Test page speed and get tips", "/speed", "/speed/observatory/", undefined, ["pagespeed", "lighthouse", "slow"]],
    ["origin-analytics", "Server response time", "Speed › Origin Analytics", "How fast your own server answers", "/speed/origin-analytics", "/speed/"],
    ["rum", "Real visitor speed", "Speed › Real user monitoring", "How fast pages load for real people", "/speed/rum", "/speed/observatory/rum-beacon/"],
    ["synthetic", "Scheduled speed checks", "Speed › Synthetic monitoring", "Test speed on a schedule", "/speed/test", "/speed/observatory/"],
    ["speed-settings", "Speed settings", "Speed › Settings", "Compression, HTTP/3 and more", "/speed/optimization", "/speed/optimization/", APP_ROUTES.speed, ["http3", "compression", "brotli", "early hints"]],
    ["smart-shield", "Server shield", "Speed › Smart Shield", "Protect and speed up your server", "/speed/smart-shield", "/smart-shield/"],
    ["cache-overview", "Cache overview", "Caching › Overview", "How much is served from saved copies", "/caching", "/cache/", APP_ROUTES.speed, ["cache", "cdn"]],
    ["cache-config", "Cache settings", "Caching › Configuration", "Clear the cache, browser cache time", "/caching/configuration", "/cache/how-to/purge-cache/", APP_ROUTES.speed, ["purge", "clear cache", "development mode"]],
    ["cache-rules", "Cache rules", "Caching › Cache Rules", "Decide what gets saved", "/caching/cache-rules", "/cache/how-to/cache-rules/"],
    ["tiered-cache", "Tiered cache", "Caching › Tiered Cache", "Fewer trips to your server", "/caching/tiered-cache", "/cache/how-to/tiered-cache/"],
    ["cache-reserve", "Long-term cache", "Caching › Cache Reserve", "Keep files saved for longer", "/caching/cache-reserve", "/cache/advanced-configuration/cache-reserve/"],
    ["argo", "Faster routes", "Traffic › Argo Smart Routing", "Route around internet congestion", "/traffic", "/argo-smart-routing/"],
  ]),
  ...build("links", "zone", [
    ["rules", "Redirects & rewrites", "Rules › Overview", "Redirect pages, rewrite links, change headers", "/rules/overview", "/rules/url-forwarding/single-redirects/", APP_ROUTES.redirects, ["redirect", "301", "302", "rewrite", "headers"]],
    ["rule-sim", "Test a rule", "Rules › Rule simulator", "Try a rule before turning it on", "/rules/simulator", "/rules/"],
    ["snippets", "Code snippets", "Rules › Snippets", "Small scripts that change requests", "/rules/snippets", "/rules/snippets/"],
    ["cloud-connector", "Route to cloud storage", "Rules › Cloud Connector", "Send paths to S3, R2 or other clouds", "/rules/cloud-connector", "/rules/cloud-connector/"],
    ["page-rules", "Page rules (classic)", "Rules › Page Rules", "The older all-in-one rules", "/rules/page-rules", "/rules/page-rules/"],
    ["rules-settings", "Rules settings", "Rules › Settings", "Link clean-up options", "/rules/settings", "/rules/normalization/"],
    ["error-pages", "Error pages", "Error Pages", "Customize pages visitors see on errors", "/error-pages", "/rules/custom-errors/"],
    ["workers-routes", "App routes", "Workers Routes", "Run an app on some paths of your website", "/workers", "/workers/configuration/routing/routes/"],
  ]),
  ...build("links", "account", [
    ["bulk-redirects", "Redirect many links", "Delivery & performance › Bulk redirects", "Redirect from a list, across sites", "/bulk-redirects", "/rules/url-forwarding/bulk-redirects/"],
    ["zaraz", "Site tags", "Delivery & performance › Web tag management", "Analytics and marketing tags without slowdown", "/tag-management/zaraz", "/zaraz/", undefined, ["google analytics", "pixel", "tag manager"]],
  ]),
  ...build("email", "zone", [
    ["dmarc", "Stop email spoofing", "Email › DMARC Management", "Stop others faking your address", "/email/dmarc-management", "/dmarc-management/", undefined, ["dmarc", "spf", "dkim", "spoofing"]],
    ["email-security", "Email security", "Email › Email Security", "Filter phishing and spam", "/email/security", "/cloudflare-one/email-security/"],
  ]),
  ...build("email", "account", [
    ["email-routing", "Forward email", "Email Service › Email Routing", "hello@ your domain, forwarded to your inbox", "/email-service/routing", "/email-service/", APP_ROUTES.email, ["forward", "inbox", "gmail", "custom address"]],
    ["email-sending", "Send email", "Email Service › Email Sending", "Send email from your domain and your apps", "/email-service/sending", "/email-service/api/send-emails/workers-api/"],
  ]),
  ...build("ai", "zone", [
    ["ai-crawl", "AI crawler overview", "AI Crawl Control › Overview", "Which AI companies visit your website", "/ai/overview", "/ai-crawl-control/", APP_ROUTES.protection, ["ai bots", "gptbot", "crawler", "scraping"]],
    ["ai-metrics", "AI crawler stats", "AI Crawl Control › Metrics", "How often AI bots visit", "/ai/metrics", "/ai-crawl-control/"],
    ["ai-security", "Allow or block AI bots", "AI Crawl Control › Security", "Choose which AI bots may visit", "/ai/security", "/bots/additional-configurations/block-ai-bots/", APP_ROUTES.protection, ["block ai"]],
    ["ai-optimization", "AI-friendly pages", "AI Crawl Control › Optimization", "Serve AI bots a lighter version", "/ai/optimization", "/ai-crawl-control/"],
    ["ai-signals", "AI usage signals", "AI Crawl Control › Signals", "Tell AI how your content may be used", "/ai/signals", "/bots/additional-configurations/managed-robots-txt/", undefined, ["robots.txt", "content signals"]],
    ["agent-overview", "Agent readiness", "Agent Readiness › Overview", "How ready your site is for AI agents", "/agent-readiness/overview", "/agents/"],
    ["agent-diag", "Agent diagnostics", "Agent Readiness › Diagnostics", "Find what blocks agents", "/agent-readiness/diagnostics", "/agents/"],
    ["agent-playground", "Agent playground", "Agent Readiness › AI Playground", "Try your site with an agent", "/agent-readiness/ai-playground", "/agents/"],
    ["webmcp", "WebMCP", "Agent Readiness › WebMCP", "Expose website actions to agents", "/agent-readiness/webmcp", "/agents/model-context-protocol/"],
  ]),
  ...build("ai", "account", [
    ["monetize", "Charge AI for access", "Monetize › Monetization Gateway", "Get paid when bots use your content", "/monetize/monetization-gateway", "/ai-crawl-control/features/pay-per-crawl/what-is-pay-per-crawl/", undefined, ["pay per crawl"]],
  ]),
  ...build("traffic", "zone", [
    ["network", "Network options", "Network", "IPv6, WebSockets and more", "/network", "/network/"],
    ["load-balancing", "Load balancing", "Traffic › Load Balancing", "Spread visitors across servers", "/traffic/load-balancing", "/load-balancing/"],
    ["lb-analytics", "Load balancing stats", "Traffic › Load Balancing Analytics", "How traffic was spread", "/traffic/load-balancing-analytics", "/load-balancing/reference/load-balancing-analytics/"],
    ["health-checks", "Uptime checks", "Traffic › Health Checks", "Get told when your server goes down", "/traffic/health-checks", "/health-checks/", undefined, ["uptime", "monitoring", "down"]],
    ["waiting-room", "Waiting room", "Traffic › Waiting Room", "Queue visitors during traffic spikes", "/traffic/waiting-rooms", "/waiting-room/"],
    ["web3", "Web3 gateways", "Traffic › Web3", "Serve IPFS or Ethereum content", "/web3", "/web3/"],
  ]),
  ...build("insights", "zone", [
    ["http-traffic", "Traffic", "Analytics › HTTP Traffic", "Requests, bandwidth and countries", "/analytics/traffic", "/analytics/types-of-analytics/", APP_ROUTES.visitors, ["traffic", "requests", "bandwidth", "countries"]],
    ["web-analytics", "Visitors", "Analytics › Web analytics", "Privacy-friendly visitor numbers", "/analytics/web/overview", "/web-analytics/", APP_ROUTES.visitors, ["visitors", "page views"]],
    ["domain-dashboard", "Key numbers", "Analytics › Domain Dashboard", "The important numbers in one place", "/domain-dashboard", "/analytics/", APP_ROUTES.home],
    ["performance", "Load times", "Analytics › Performance", "Page load times over time", "/analytics/performance", "/analytics/"],
    ["dashboards", "Dashboards", "Analytics › Dashboards", "Build your own charts", "/dashboards", "/analytics/"],
    ["log-search", "Search logs", "Log Explorer › Log search", "Search raw request logs", "/log-explorer/log-search", "/log-explorer/", undefined, ["logs"]],
    ["logpush", "Export logs", "Log Explorer › Logpush", "Send logs to your own tools", "/analytics/logs", "/logs/logpush/"],
  ]),
  ...build("insights", "account", [
    ["account-analytics", "Account traffic", "Analytics › Account analytics", "Traffic across every website", "/analytics", "/analytics/account-and-zone-analytics/account-analytics/"],
  ]),
  ...build("apps", "account", [
    ["workers-pages", "Apps & sites", "Compute › Workers & Pages", "Deploy websites, APIs and full apps", "/workers-and-pages", "/workers/", APP_ROUTES.apps, ["deploy", "workers", "pages", "hosting"]],
    ["observability", "App logs & errors", "Compute › Observability", "Logs and errors from your apps", "/observability", "/workers/observability/"],
    ["wfp", "Apps for your customers", "Compute › Workers for Platforms", "Let your users deploy code", "/workers-for-platforms", "/cloudflare-for-platforms/workers-for-platforms/"],
    ["containers", "Containers", "Compute › Containers", "Run container images close to users", "/workers/containers", "/containers/", undefined, ["docker"]],
    ["durable-objects", "Live shared state", "Compute › Durable Objects", "State for chats, games and collaboration", "/workers/durable-objects", "/durable-objects/"],
    ["queues", "Background jobs", "Compute › Queues", "Do work later, in the background", "/workers/queues", "/queues/"],
    ["workflows", "Multi-step jobs", "Compute › Workflows", "Long tasks, step by step, with retries", "/workers/workflows", "/workflows/"],
    ["browser-run", "Headless browser", "Compute › Browser Run", "Screenshots, PDFs and page crawling", "/workers/browser-run", "/browser-run/"],
    ["vpc", "Private network access", "Compute › VPC", "Let apps reach private services", "/workers/vpc", "/workers-vpc/"],
    ["workers-plans", "Plan & limits", "Compute › Workers plans", "Your apps plan and usage limits", "/workers/plans", "/workers/platform/pricing/", undefined, ["pricing", "limits"]],
    ["flagship", "Feature flags", "Compute › Flagship", "Turn features on or off without redeploying", "/flagship", "/workers/"],
  ]),
  ...build("ai_build", "account", [
    ["ai-models", "Model catalog", "AI › Models", "AI models you can use", "/ai/models", "/workers-ai/models/"],
    ["workers-ai", "Run AI models", "AI › Workers AI", "Call AI models from your apps (powers this assistant)", "/ai/workers-ai", "/workers-ai/", undefined, ["neurons", "ai usage"]],
    ["ai-gateway", "AI request gateway", "AI › AI Gateway", "Cache, log and limit calls to AI providers", "/ai/ai-gateway", "/ai-gateway/"],
    ["vectorize", "Vector database", "AI › Vectorize", "Store embeddings for search and memory", "/ai/vectorize", "/vectorize/"],
    ["ai-search", "AI search", "AI › AI Search", "AI-powered search over your content", "/ai/ai-search", "/ai-search/"],
    ["agent-tracing", "Agent tracing", "AI › Agent tracing", "Follow what your AI agents did", "/agents", "/agents/"],
  ]),
  ...build("data", "account", [
    ["r2", "File storage", "Storage & databases › R2 Object Storage", "Store files with no download fees", "/r2/overview", "/r2/", undefined, ["s3", "files", "bucket"]],
    ["hyperdrive", "Connect your database", "Storage & databases › Hyperdrive", "Speed up your Postgres or MySQL", "/workers/hyperdrive", "/hyperdrive/"],
    ["kv", "Key-value store", "Storage & databases › Workers KV", "Fast storage for settings and small data", "/workers/kv/namespaces", "/kv/"],
    ["d1", "SQL database", "Storage & databases › D1 SQLite Database", "A simple SQL database for apps", "/workers/d1", "/d1/", undefined, ["sqlite", "database"]],
    ["analytics-engine", "Custom metrics store", "Storage & databases › Analytics Engine", "Write and query your own metrics", "/workers/analytics-engine", "/analytics/analytics-engine/"],
    ["pipelines", "Data pipelines", "Storage & databases › Pipelines", "Move and transform streaming data", "/pipelines/overview", "/basin-pipelines/"],
    ["secrets-store", "Secrets vault", "Storage & databases › Secrets Store", "Keep API keys in one place", "/secrets-store", "/secrets-store/"],
  ]),
  ...build("media", "account", [
    ["img-transform", "Resize & optimize images", "Images & Stream › Transformations", "Resize and compress images on the fly", "/media/transformations", "/images/optimization/transformations/overview/"],
    ["img-hosted", "Image hosting", "Images & Stream › Hosted images", "Upload and serve images", "/images/hosted", "/images/storage/upload-images/methods/"],
    ["stream-videos", "Video hosting", "Images & Stream › Hosted videos", "Upload and stream videos", "/stream/videos", "/stream/"],
    ["stream-live", "Live streaming", "Images & Stream › Live inputs", "Broadcast live video", "/stream/inputs", "/stream/stream-live/"],
    ["realtime-kit", "Video calls kit", "Realtime › RealtimeKit", "Add calls and meetings to your app", "/realtime/kit", "/realtime/"],
    ["turn", "Call relay", "Realtime › TURN Server", "Help calls connect through firewalls", "/realtime/turn", "/realtime/turn/"],
    ["sfu", "Media server", "Realtime › Serverless SFU", "Route audio and video between many people", "/realtime/sfu", "/realtime/sfu/"],
  ]),
  ...build("network", "account", [
    ["tunnels", "Tunnels", "Networking › Tunnels", "Put a local server online without opening ports", "/tunnels", "/cloudflare-one/networks/connectors/cloudflare-tunnel/", undefined, ["localhost", "expose server", "cloudflared"]],
    ["net-overview", "Network overview", "Networking › Overview", "Your connected networks", "/magic-networks/overview", "/cloudflare-one/"],
    ["mesh", "Mesh", "Networking › Mesh", "Connect your devices and offices", "/mesh", "/cloudflare-one/"],
    ["ip-space", "Your IP ranges", "Networking › IP addresses › Address space", "Bring your own IP ranges", "/ip-addresses/address-space", "/byoip/"],
  ]),
  ...build("account", "account", [
    ["members", "Team members", "Manage account › Members", "Invite people and set what they can do", "/members", "/fundamentals/manage-members/", undefined, ["invite", "team", "roles"]],
    ["billing", "Billing", "Manage account › Billing", "Plans, invoices and payment", "/billing", "/billing/", undefined, ["invoice", "payment", "plan"]],
    ["api-tokens", "API tokens", "Manage account › Account API tokens", "Keys for scripts and tools", "/api-tokens", "/fundamentals/api/get-started/create-token/", undefined, ["token", "api key"]],
    ["audit-log", "Activity history", "Manage account › Audit logs", "Who changed what, and when", "/audit-log", "/fundamentals/account/account-security/review-audit-logs/"],
    ["alerts", "Alerts", "Manage account › Alerts", "Get notified when something needs attention", "/notifications", "/notifications/", undefined, ["notifications"]],
    ["abuse-reports", "Abuse reports", "Manage account › Abuse reports", "Reports filed against your sites", "/abuse-reports", "/fundamentals/reference/report-abuse/"],
    ["configurations", "Account settings", "Manage account › Configurations", "Account-wide settings", "/configurations", "/fundamentals/account/"],
  ]),
];

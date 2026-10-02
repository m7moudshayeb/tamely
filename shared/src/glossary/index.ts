/** Plain-word explanations. Used by the Learn page (SEO/AEO) and by the assistant. */
export interface GlossaryTerm {
  id: string;
  term: string;
  aka: string;
  plain: string;
  example: string;
  docs: string;
}

const D = "https://developers.cloudflare.com";

export const GLOSSARY: GlossaryTerm[] = [
  { id: "dns", term: "Address records", aka: "DNS", plain: "The internet's address book. Each record says where a name like www.yoursite.com should go.", example: "Point www to Vercel so your site shows up.", docs: `${D}/dns/` },
  { id: "a-record", term: "Point to a server", aka: "A record", plain: "Sends a name to a server's number address (its IP).", example: "yoursite.com → 203.0.113.10", docs: `${D}/dns/manage-dns-records/reference/dns-record-types/` },
  { id: "cname", term: "Point to a service", aka: "CNAME record", plain: "Sends a name to another name, usually a hosting service.", example: "www → cname.vercel-dns.com", docs: `${D}/dns/manage-dns-records/reference/dns-record-types/` },
  { id: "mx", term: "Receive email", aka: "MX record", plain: "Tells other mail servers where to deliver email for your domain.", example: "Google Workspace gives you MX records to add.", docs: `${D}/dns/manage-dns-records/reference/dns-record-types/` },
  { id: "txt", term: "Proof of ownership", aka: "TXT record", plain: "A note on your domain that other services read to confirm you own it.", example: "Stripe or Google asks you to add one to verify.", docs: `${D}/dns/manage-dns-records/reference/dns-record-types/` },
  { id: "nameservers", term: "Who runs your address book", aka: "Nameservers", plain: "The two names at your domain seller that hand control of your domain to Cloudflare.", example: "Set them at GoDaddy or Namecheap to finish setup.", docs: `${D}/dns/zone-setups/full-setup/setup/` },
  { id: "proxy", term: "Protected by Cloudflare", aka: "Proxied (orange cloud)", plain: "Visitors reach Cloudflare first, which hides your server, blocks attacks and speeds things up.", example: "Keep websites protected. Turn it off for email-only records.", docs: `${D}/dns/proxy-status/` },
  { id: "ssl", term: "Secure padlock", aka: "SSL/TLS, https", plain: "Encrypts traffic so nobody in between can read it. Browsers show a padlock.", example: "\"Full (strict)\" is the safest mode if your server has a certificate.", docs: `${D}/ssl/origin-configuration/ssl-modes/` },
  { id: "always-https", term: "Always use the secure address", aka: "Always Use HTTPS", plain: "Sends anyone who types http:// to the secure https:// version.", example: "Stops 'Not secure' warnings in browsers.", docs: `${D}/ssl/edge-certificates/additional-options/always-use-https/` },
  { id: "cache", term: "Saved copies", aka: "Cache / CDN", plain: "Cloudflare keeps copies of your files near visitors so pages load faster and your server works less.", example: "Clear saved copies after you update your site.", docs: `${D}/cache/` },
  { id: "dev-mode", term: "Development mode", aka: "Development Mode", plain: "Pauses saved copies for 3 hours so you see changes instantly while you work.", example: "Turn on while editing, then let it switch itself off.", docs: `${D}/cache/reference/development-mode/` },
  { id: "under-attack", term: "Under attack mode", aka: "I'm Under Attack Mode", plain: "Shows visitors a short check before they enter. Use only during an attack.", example: "Turn on when your site is flooded with fake traffic.", docs: `${D}/fundamentals/reference/under-attack-mode/` },
  { id: "ddos", term: "Flood attack", aka: "DDoS", plain: "Many machines sending fake traffic at once to knock a site offline. Cloudflare blocks these for free.", example: "Your 'threats blocked' number includes these.", docs: `${D}/ddos-protection/` },
  { id: "waf", term: "Firewall", aka: "WAF", plain: "Rules that stop known hacking tricks before they reach your site.", example: "Block a country or an IP that keeps attacking you.", docs: `${D}/waf/` },
  { id: "bots", term: "Bots", aka: "Bot traffic", plain: "Automated visitors. Some are useful (Google), some steal content or spam forms.", example: "Bot fight mode challenges the bad ones.", docs: `${D}/bots/` },
  { id: "ai-bots", term: "AI crawlers", aka: "AI bots", plain: "Bots from AI companies that read your pages to train or answer questions.", example: "Block them if you don't want your content used for AI.", docs: `${D}/bots/additional-configurations/block-ai-bots/` },
  { id: "redirect", term: "Redirect", aka: "301 / 302 redirect", plain: "Automatically sends visitors from one link to another. 301 means forever, 302 means for now.", example: "/old-pricing → https://yoursite.com/pricing", docs: `${D}/rules/url-forwarding/single-redirects/` },
  { id: "email-routing", term: "Email forwarding", aka: "Email Routing", plain: "Gives you addresses like hello@yoursite.com and forwards mail to an inbox you already use.", example: "hello@yoursite.com → you@gmail.com", docs: `${D}/email-service/` },
  { id: "workers", term: "Apps", aka: "Workers & Pages", plain: "Code and websites that run on Cloudflare's network instead of your own server.", example: "Your Astro or Next.js site deployed to Cloudflare.", docs: `${D}/workers/` },
  { id: "workers-ai", term: "Cloudflare AI", aka: "Workers AI", plain: "AI models run by Cloudflare. Tamely's assistant runs on your account, free up to a daily allowance.", example: "10,000 free units a day.", docs: `${D}/workers-ai/platform/pricing/` },
];

export const findTerm = (id: string): GlossaryTerm | undefined => GLOSSARY.find((t) => t.id === id);

/** Questions and answers shown on the landing page (FAQ schema for answer engines). */
export const FAQ: { q: string; a: string }[] = [
  { q: "What is Tamely?", a: "A simple control panel for Cloudflare. You ask in plain words, it looks things up, explains what it found with sources, and prepares changes you confirm with one tap." },
  { q: "Is Tamely made by Cloudflare?", a: "No. Tamely is an independent project built on Cloudflare's public API. It isn't made or endorsed by Cloudflare." },
  { q: "Does Tamely cost anything?", a: "No. It runs its assistant on Cloudflare's own AI inside your account, which is free up to 10,000 units a day. Most people never reach that." },
  { q: "Is my Cloudflare token safe?", a: "Tamely stores nothing on its servers. Your sign-in is encrypted in a cookie that page scripts can't read, and it ends after 7 days without use. Sign in with Cloudflare is the safest option: access is short-lived and you can revoke it any time. To sign out on every device, use Sign out everywhere." },
  { q: "What permissions does it need?", a: "One click opens Cloudflare's token page with everything filled in: reading your sites and stats, editing DNS, safety switches, email forwarding, redirects, clearing the cache, and running Cloudflare AI." },
  { q: "Can it break my website?", a: "Changes never happen on their own. Each one shows a plain summary and a Confirm button, and risky changes are marked." },
  { q: "Do I need to understand DNS or SSL?", a: "No. Every screen uses plain words, and every Cloudflare term is explained with a link to the official docs." },
];

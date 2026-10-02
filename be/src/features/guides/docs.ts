import { DOCS_MAX_CHARS, DOCS_ORIGIN, DOCS_TIMEOUT_MS } from "../../shared/constants/guides";
import { MSG } from "../../shared/constants/copy";
import { AppError } from "../../shared/lib/errors";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** Main text of a docs page: no menus, scripts or markup. */
export function docsText(html: string): string {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
  return main
    .replace(/<(script|style|svg|nav|aside|header|footer|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|li|h[1-6]|tr|div)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_m, e: string) => ENTITIES[e])
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, DOCS_MAX_CHARS);
}

/** Only Cloudflare's docs site is ever fetched (tests may point it at localhost). */
export async function readDocs(docsUrl: string, override?: string): Promise<string> {
  const url = new URL(docsUrl);
  if (url.origin !== DOCS_ORIGIN) throw new AppError(MSG.notFound, 404, "not_found");
  const base = override && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(override) ? override.replace(/\/$/, "") : DOCS_ORIGIN;
  let res: Response;
  try {
    res = await fetch(base + url.pathname, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(DOCS_TIMEOUT_MS) });
  } catch {
    throw new AppError("Couldn't reach Cloudflare's docs right now. Try again in a moment.", 502, "docs_offline");
  }
  if (!res.ok) throw new AppError("Couldn't read Cloudflare's docs for this right now.", 502, "docs_unavailable");
  const text = docsText(await res.text());
  if (text.length < 80) throw new AppError("Cloudflare's docs page for this came back empty.", 502, "docs_empty");
  return text;
}

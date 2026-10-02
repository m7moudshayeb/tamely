// After `astro build`: copy each page's hash-based CSP (from its <meta>) into _headers,
// so the HTTP header is as strict as the page. Header and meta then match exactly.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
const EXTRA = "default-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const rules = [];
for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, "utf8");
  const meta = html.match(/<meta http-equiv="content-security-policy" content="([^"]+)"/i)?.[1];
  if (!meta) continue;
  const rel = relative(DIST, file).split(sep).join("/");
  const paths = rel === "index.html" ? ["/"] : rel.endsWith("/index.html") ? [`/${rel.slice(0, -11)}`, `/${rel.slice(0, -10)}`] : [`/${rel}`];
  const policy = `${meta.replace(/&#39;/g, "'").replace(/;\s*$/, "")}; ${EXTRA}`;
  for (const p of paths) rules.push(`${p}\n  Content-Security-Policy: ${policy}`);
}

const headersFile = join(DIST, "_headers");
const base = await readFile(headersFile, "utf8");
await writeFile(headersFile, `${base.trimEnd()}\n\n# Per-page CSP, generated from each page's hashes (scripts/csp-headers.mjs)\n${rules.join("\n\n")}\n`);
console.log(`csp-headers: ${rules.length} page rules written`);

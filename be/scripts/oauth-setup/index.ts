import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DEFAULT_OAUTH_SCOPES, OAUTH_CALLBACK_PATH } from "../../src/shared/constants/cloudflare/oauth.ts";
import { createClient, listAccounts } from "./cloudflare.ts";
import { setDevVars } from "./dev-vars.ts";
import { ask, closeInput, ok, say, step } from "./prompt.ts";

/* One command instead of the dashboard form: makes the OAuth client and saves its keys. */
const DEV_VARS = process.env.TAMELY_DEV_VARS || fileURLToPath(new URL("../../.dev.vars", import.meta.url));
const DEFAULT_SITE = "https://tamely.dev";
const LOCAL = ["http://127.0.0.1:4321", "http://127.0.0.1:8877"];
const SETUP_TOKEN_URL = `https://dash.cloudflare.com/profile/api-tokens?${new URLSearchParams({
  permissionGroupKeys: JSON.stringify([{ key: "oauth_client", type: "edit" }]),
  accountId: "*",
  zoneId: "all",
  name: "Tamely setup (delete after)",
})}`;

const openInBrowser = (url: string) => {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";
  try {
    spawn(cmd, [url], { stdio: "ignore", detached: true }).on("error", () => {}).unref();
  } catch {
    /* No browser here: the link is printed anyway. */
  }
};

/** Sends a value to the live Worker through stdin, so it never shows up in a command line. */
const putSecret = (name: string, value: string) =>
  new Promise<boolean>((resolve) => {
    const p = spawn("npx", ["wrangler", "secret", "put", name], { stdio: ["pipe", "inherit", "inherit"], cwd: fileURLToPath(new URL("../..", import.meta.url)) });
    p.on("error", () => resolve(false));
    p.on("close", (code) => resolve(code === 0));
    p.stdin.end(value);
  });

async function main() {
  say("\nTamely · set up “Sign in with Cloudflare”\n");
  step(1, "Make a one-time setup key. This link opens Cloudflare with everything filled in:");
  say(`   ${SETUP_TOKEN_URL}`);
  say("   Click “Continue to summary”, then “Create Token”, and copy the key.");
  if (!process.env.CI) openInBrowser(SETUP_TOKEN_URL);
  const token = await ask("   Paste the key here (hidden): ", { hidden: true });
  if (!/^[A-Za-z0-9_-]{30,}$/.test(token)) throw new Error("That doesn't look like a Cloudflare key. Copy the whole key and run this again.");

  const accounts = await listAccounts(token);
  if (!accounts.length) throw new Error("That key can't see any account. Make it again with “All accounts” selected.");
  let account = accounts[0];
  if (accounts.length > 1) {
    accounts.forEach((a, i) => say(`   ${i + 1}. ${a.name}`));
    const pick = Number(await ask("   Which account? (number): "));
    account = accounts[pick - 1] || account;
  }
  ok(`Account: ${account.name}`);

  step(2, "Where will Tamely live?");
  const typed = (await ask(`   Site address (Enter for ${DEFAULT_SITE}): `)) || DEFAULT_SITE;
  const site = new URL(/^https?:\/\//.test(typed) ? typed : `https://${typed}`).origin;

  step(3, "Creating the sign-in app on Cloudflare…");
  const client = await createClient(token, account.id, {
    client_name: "Tamely",
    response_types: ["code"],
    grant_types: ["authorization_code", "refresh_token"],
    token_endpoint_auth_method: "client_secret_post",
    redirect_uris: [site, ...LOCAL].map((o) => o + OAUTH_CALLBACK_PATH),
    client_uri: site,
    scopes: DEFAULT_OAUTH_SCOPES,
  });
  ok("Created “Tamely”");

  const hasSecret = (await readFile(DEV_VARS, "utf8").catch(() => "")).includes("SESSION_SECRET=");
  await setDevVars(DEV_VARS, {
    OAUTH_CLIENT_ID: client.id,
    OAUTH_CLIENT_SECRET: client.secret,
    ...(hasSecret ? {} : { SESSION_SECRET: randomBytes(32).toString("base64url") }),
  });
  ok("Saved to be/.dev.vars (the secret isn't shown anywhere)");

  step(4, "Your live site");
  const live = (await ask("   Also send these to your deployed Worker now? (y/N): ")).toLowerCase() === "y";
  if (live) {
    const sent = (await putSecret("OAUTH_CLIENT_ID", client.id)) && (await putSecret("OAUTH_CLIENT_SECRET", client.secret));
    sent ? ok("Sent to your Worker") : say("   Couldn't reach wrangler. Later, run: npx wrangler secret put OAUTH_CLIENT_SECRET");
  }

  say("\nDone. Last steps:");
  say("  • Delete the setup key: https://dash.cloudflare.com/profile/api-tokens");
  say("  • Restart `yarn dev` and open http://127.0.0.1:4321 — the button appears on the connect screen.");
  say("  • Only your account can use it for now. To let anyone sign in, open OAuth clients on Cloudflare,");
  say("    add a logo, and verify your domain (Cloudflare shows a TXT record to add).\n");
}

main()
  .catch((e: Error) => {
    say(`\n  ✗ ${e.message}\n`);
    process.exitCode = 1;
  })
  .finally(closeInput);

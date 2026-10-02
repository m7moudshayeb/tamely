import { spawn } from "node:child_process";
import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { GOOD_TOKEN, MOCK, resetMock } from "./helpers";

const SCRIPT = fileURLToPath(new URL("../../be/scripts/oauth-setup/index.ts", import.meta.url));

/** Runs `yarn oauth:setup` with typed answers, against the mock Cloudflare API and a scratch .dev.vars. */
function runSetup(answers: string[], devVars: string): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ["--experimental-strip-types", "--no-warnings", SCRIPT], {
      env: { ...process.env, CI: "1", CF_API_BASE: `${MOCK}/client/v4`, TAMELY_DEV_VARS: devVars },
    });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => resolve({ code: code ?? 1, out }));
    p.stdin.end(answers.join("\n") + "\n");
  });
}

test.beforeEach(resetMock);

test("one command creates the sign-in app and saves its keys", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tamely-"));
  const devVars = join(dir, ".dev.vars");
  await writeFile(devVars, "SESSION_SECRET=keep-me\nOTHER=1\n");

  const { code, out } = await runSetup([GOOD_TOKEN, "example.com", "n"], devVars);
  expect(code, out).toBe(0);
  expect(out).toContain("Created “Tamely”");
  expect(out).not.toContain("MOCK_CLIENT_SECRET_value");
  expect(out).not.toContain(GOOD_TOKEN);

  const saved = await readFile(devVars, "utf8");
  expect(saved).toContain("SESSION_SECRET=keep-me\nOTHER=1\n");
  expect(saved).toContain("OAUTH_CLIENT_ID=mock-client-id\n");
  expect(saved).toContain("OAUTH_CLIENT_SECRET=MOCK_CLIENT_SECRET_value\n");
  expect((await stat(devVars)).mode & 0o777).toBe(0o600);

  const calls = await (await fetch(`${MOCK}/__calls`)).json();
  const create = calls.find((c: any) => c.method === "POST" && c.path.endsWith("/oauth_clients"));
  expect(create.body).toMatchObject({
    client_name: "Tamely",
    response_types: ["code"],
    grant_types: ["authorization_code", "refresh_token"],
    token_endpoint_auth_method: "client_secret_post",
    client_uri: "https://example.com",
    redirect_uris: [
      "https://example.com/api/v1/auth/cloudflare/callback",
      "http://127.0.0.1:4321/api/v1/auth/cloudflare/callback",
      "http://127.0.0.1:8877/api/v1/auth/cloudflare/callback",
    ],
  });
  expect(create.body.scopes).toEqual(expect.arrayContaining(["offline_access", "dns.write", "ai.write"]));
});

test("a wrong key stops early with a plain message", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tamely-"));
  const { code, out } = await runSetup(["nope"], join(dir, ".dev.vars"));
  expect(code).toBe(1);
  expect(out).toContain("doesn't look like a Cloudflare key");
});

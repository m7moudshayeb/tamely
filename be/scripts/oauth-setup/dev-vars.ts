import { chmod, readFile, writeFile } from "node:fs/promises";

/** Sets KEY=value lines in .dev.vars, keeping every other line as it was. */
export async function setDevVars(path: string, values: Record<string, string>): Promise<void> {
  const current = await readFile(path, "utf8").catch(() => "");
  const lines = current.split("\n").filter((l, i, all) => !(i === all.length - 1 && l === ""));
  for (const [key, value] of Object.entries(values)) {
    const at = lines.findIndex((l) => l.startsWith(`${key}=`));
    if (at >= 0) lines[at] = `${key}=${value}`;
    else lines.push(`${key}=${value}`);
  }
  await writeFile(path, lines.join("\n") + "\n", { mode: 0o600 });
  await chmod(path, 0o600);
}

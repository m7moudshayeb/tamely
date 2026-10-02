import { createInterface, type Interface } from "node:readline";
import { stdin, stdout } from "node:process";

/* One shared reader with a queue, so piped answers are never dropped between questions. */
let rl: Interface | null = null;
const lines: string[] = [];
const waiting: ((line: string) => void)[] = [];
let muted = false;

function reader(): Interface {
  if (rl) return rl;
  rl = createInterface({ input: stdin, output: stdout, terminal: stdin.isTTY });
  const out = rl as unknown as { _writeToOutput: (s: string) => void };
  const write = out._writeToOutput.bind(rl);
  out._writeToOutput = (s) => write(muted && s !== "\r\n" && s !== "\n" ? s.replace(/[^\r\n]/g, "•") : s);
  rl.on("line", (line) => {
    const next = waiting.shift();
    if (next) next(line);
    else lines.push(line);
  });
  return rl;
}

/** One line of input. Hidden input shows dots, so keys don't end up on screen or in history. */
export function ask(question: string, opts: { hidden?: boolean } = {}): Promise<string> {
  reader();
  stdout.write(question);
  muted = !!opts.hidden && stdin.isTTY;
  return new Promise((resolve) => {
    const done = (line: string) => {
      muted = false;
      if (opts.hidden && stdin.isTTY) stdout.write("\n");
      resolve(line.trim());
    };
    const queued = lines.shift();
    if (queued !== undefined) done(queued);
    else waiting.push(done);
  });
}

export const closeInput = () => rl?.close();
export const say = (text = "") => stdout.write(text + "\n");
export const ok = (text: string) => say(`  ✓ ${text}`);
export const step = (n: number, text: string) => say(`\n${n}. ${text}`);

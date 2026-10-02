import { SIGNED_OUT_EVENT } from "@shared/api/errors";
import { STORAGE_KEYS } from "@shared/constants/storage";
import type { Message } from "../types";

/** A thread lives 30 minutes after the last message, in this tab only. Nothing goes to our servers. */
export const CHAT_TTL_MS = 30 * 60 * 1000;
const MAX_MESSAGES = 60;
const MAX_SITES = 5;

interface Thread {
  messages: Message[];
  updatedAt: number;
}
type Threads = Record<string, Thread>;

const EMPTY: Message[] = [];
const listeners = new Set<() => void>();
let threads: Threads | null = null;
let timer: number | undefined;

const fresh = (t: Thread | undefined) => !!t && Date.now() - t.updatedAt < CHAT_TTL_MS;
const valid = (m: unknown): m is Message =>
  !!m && typeof m === "object" && typeof (m as Message).id === "string" && ((m as Message).role === "user" || (m as Message).role === "assistant");

/** A reload cuts any answer that was still arriving; show it as stopped instead of spinning forever. */
const settle = (m: Message): Message => (m.role === "assistant" && m.status === "streaming" ? { ...m, status: "stopped" } : m);

function load(): Threads {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(STORAGE_KEYS.chat) || "{}") as Threads;
    const out: Threads = {};
    for (const [zone, t] of Object.entries(raw || {})) {
      if (fresh(t) && Array.isArray(t.messages)) out[zone] = { updatedAt: t.updatedAt, messages: t.messages.filter(valid).map(settle) };
    }
    return out;
  } catch {
    return {};
  }
}

function save() {
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(threads));
  } catch {
    /* Storage full or off: the thread still works until the tab closes. */
  }
}

/** Wipes threads the moment they expire, even if the page stays open. */
function schedule() {
  window.clearTimeout(timer);
  const next = Math.min(...Object.values(threads || {}).map((t) => t.updatedAt + CHAT_TTL_MS));
  if (Number.isFinite(next)) timer = window.setTimeout(expire, Math.max(1000, next - Date.now()));
}

function expire() {
  if (!threads) return;
  threads = Object.fromEntries(Object.entries(threads).filter(([, t]) => fresh(t)));
  save();
  schedule();
  listeners.forEach((l) => l());
}

/** Signing out wipes every thread in this tab straight away. */
function wipe() {
  threads = {};
  save();
  window.clearTimeout(timer);
  listeners.forEach((l) => l());
}

function all(): Threads {
  if (!threads) {
    threads = load();
    schedule();
    window.addEventListener(SIGNED_OUT_EVENT, wipe);
  }
  return threads;
}

export const chatStore = {
  get: (zone: string): Message[] => all()[zone]?.messages || EMPTY,
  set(zone: string, update: (messages: Message[]) => Message[]) {
    const current = all();
    const messages = update(current[zone]?.messages || EMPTY).slice(-MAX_MESSAGES);
    const rest = Object.entries(current).filter(([z]) => z !== zone).sort((a, b) => b[1].updatedAt - a[1].updatedAt).slice(0, MAX_SITES - 1);
    threads = Object.fromEntries(messages.length ? [[zone, { messages, updatedAt: Date.now() }], ...rest] : rest);
    save();
    schedule();
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

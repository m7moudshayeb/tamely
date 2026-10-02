/** Browser storage keys. Bump the version when the stored shape changes. */
export const STORAGE_KEYS = {
  sidebar: "tamely.sidebar.v1",
  /** Per-tab (sessionStorage): the open chat, wiped after 30 quiet minutes. */
  chat: "tamely.chat.v1",
  /** Per-tab: guides already written, so reopening one doesn't spend AI again. */
  guides: "tamely.guides.v1",
} as const;

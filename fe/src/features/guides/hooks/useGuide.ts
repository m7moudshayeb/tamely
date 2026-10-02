import { useQuery } from "@tanstack/react-query";
import type { Guide } from "@tamely/shared/types";
import { api } from "@shared/api/endpoints";
import { STORAGE_KEYS } from "@shared/constants/storage";
import { QK } from "@shared/constants/query";

/** Guides are kept for 30 minutes in this tab only, so reopening one doesn't use your AI allowance again. */
const TTL_MS = 30 * 60 * 1000;
const key = (pageId: string, zoneId: string | null) => `${STORAGE_KEYS.guides}:${pageId}:${zoneId || "-"}`;

function cached(pageId: string, zoneId: string | null): Guide | undefined {
  try {
    const g = JSON.parse(window.sessionStorage.getItem(key(pageId, zoneId)) || "null") as Guide | null;
    return g && g.pageId === pageId && Date.now() - Date.parse(g.generatedAt) < TTL_MS ? g : undefined;
  } catch {
    return undefined;
  }
}

function remember(g: Guide, zoneId: string | null) {
  try {
    window.sessionStorage.setItem(key(g.pageId, zoneId), JSON.stringify(g));
  } catch {
    /* Storage off: the guide still shows, it just isn't kept. */
  }
}

/** Plain-words guide for one Cloudflare page, written from its official docs by the person's Cloudflare AI. */
export function useGuide(pageId: string, zoneId: string | null) {
  return useQuery({
    queryKey: QK.guide(pageId, zoneId),
    queryFn: async () => {
      const g = await api.guide(pageId, zoneId);
      remember(g, zoneId);
      return g;
    },
    initialData: () => cached(pageId, zoneId),
    initialDataUpdatedAt: () => {
      const g = cached(pageId, zoneId);
      return g ? Date.parse(g.generatedAt) : undefined;
    },
    staleTime: TTL_MS,
    gcTime: TTL_MS,
    retry: false,
  });
}

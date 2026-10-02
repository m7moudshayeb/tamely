import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Site } from "@tamely/shared/types";
import { useSites } from "../hooks/useSites";
import { STORAGE_KEYS, storage } from "../lib/storage";

interface SiteState {
  sites: Site[];
  site: Site | null;
  setSiteId: (id: string) => void;
  loading: boolean;
  error: Error | null;
}

const Ctx = createContext<SiteState>({ sites: [], site: null, setSiteId: () => {}, loading: true, error: null });

/** The website the person is looking at; remembered per browser. */
export function SiteProvider({ children }: { children: ReactNode }) {
  const q = useSites();
  const [id, setId] = useState<string | null>(() => storage.get(STORAGE_KEYS.site));
  const sites = q.data || [];
  const site = sites.find((s) => s.id === id) || sites.find((s) => s.status === "active") || sites[0] || null;
  useEffect(() => {
    if (site && site.id !== id) setId(site.id);
  }, [site, id]);
  const value = useMemo<SiteState>(
    () => ({
      sites,
      site,
      loading: q.isLoading,
      error: (q.error as Error) || null,
      setSiteId: (next) => {
        storage.set(STORAGE_KEYS.site, next);
        setId(next);
      },
    }),
    [sites, site, q.isLoading, q.error],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCurrentSite = () => useContext(Ctx);

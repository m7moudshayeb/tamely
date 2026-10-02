import { useEffect, useState } from "react";
import { AUTH_ERRORS } from "@shared/constants/copy";

/** Reads ?auth_error / ?welcome left by the Cloudflare sign-in redirect, then cleans the URL. */
export function useAuthReturn(): { error: string | null; welcome: boolean } {
  const [state] = useState(() => {
    if (typeof window === "undefined") return { error: null, welcome: false };
    const q = new URLSearchParams(window.location.search);
    const code = q.get("auth_error");
    return { error: code ? AUTH_ERRORS[code] || AUTH_ERRORS.failed : null, welcome: q.get("welcome") === "1" };
  });
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("auth_error") && !url.searchParams.has("welcome")) return;
    url.searchParams.delete("auth_error");
    url.searchParams.delete("welcome");
    window.history.replaceState(null, "", url.pathname + (url.search || "") + url.hash);
  }, []);
  return state;
}

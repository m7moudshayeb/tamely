import { dashUrl, findPage } from "@tamely/shared/catalog";
import { useCurrentSite } from "../context/SiteContext";
import { useSession } from "./useSession";

/** Deep link into Cloudflare's dashboard + docs for a catalog page. */
export function useDashLink(pageId: string) {
  const session = useSession();
  const { site } = useCurrentSite();
  const page = findPage(pageId);
  if (!page) return null;
  return { page, dash: dashUrl(page, session.data?.account?.id, site?.name), docs: page.docs };
}

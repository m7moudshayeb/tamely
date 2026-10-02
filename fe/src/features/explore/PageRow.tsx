import { dashUrl, type CatalogPage } from "@tamely/shared/catalog";
import { useCurrentSite } from "@shared/context/SiteContext";
import { useSession } from "@shared/hooks/useSession";
import { Badge, Icon } from "@ui";
import { pageIcon } from "./art";
import styles from "./ExplorePage.module.css";
import { PinButton } from "./PinButton";

/** Pages we handle open inside Tamely; the rest open on Cloudflare in a new tab. */
export function PageRow({ page, onOpen, highlighted }: { page: CatalogPage; onOpen: (p: CatalogPage) => void; highlighted?: boolean }) {
  const account = useSession().data?.account?.id;
  const { site } = useCurrentSite();
  const inner = (
    <>
      <span className={styles.pageIcon}><Icon name={pageIcon(page)} size={14} /></span>
      <span className={styles.pageText}>
        <b>{page.title} {page.appRoute && <Badge tone="accent">In Tamely</Badge>}</b>
        <span>{page.summary}</span>
      </span>
      <Icon name={page.appRoute ? "chevronRight" : "arrowUpRight"} size={12} weight={2.2} className={styles.go} />
    </>
  );
  return (
    <li className={[styles.pageItem, highlighted ? styles.hit : ""].join(" ")} data-page-id={page.id} data-highlighted={highlighted || undefined}>
      {page.appRoute ? (
        <button type="button" className={styles.page} onClick={() => onOpen(page)}>{inner}</button>
      ) : (
        <a className={styles.page} href={dashUrl(page, account, site?.name)} target="_blank" rel="noopener noreferrer" title={`On Cloudflare: ${page.cfName}`}>{inner}</a>
      )}
      <PinButton page={page} />
    </li>
  );
}

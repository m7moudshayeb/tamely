import { Link, useLocation, useParams } from "wouter";
import { CATALOG_GROUPS, CATALOG_PAGES, findPage } from "@tamely/shared/catalog";
import { APP_ROUTES, guidePath } from "@tamely/shared/routes";
import { GROUP_ART, pageIcon } from "@features/explore/art";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import { SidebarToggleButton } from "@features/shell/components/SidebarToggleButton";
import { useCurrentSite } from "@shared/context/SiteContext";
import { useDashLink } from "@shared/hooks/useDashLink";
import { Button, EmptyState, Icon, LinkButton } from "@ui";
import { GuideBody } from "./components/GuideBody";
import styles from "./GuidePage.module.css";

/** One Cloudflare feature explained in Tamely: what it's for, steps from the docs, and a way out to Cloudflare. */
export default function GuidePage() {
  const { pageId = "" } = useParams<{ pageId: string }>();
  const [, navigate] = useLocation();
  const { site } = useCurrentSite();
  const page = findPage(decodeURIComponent(pageId));
  const link = useDashLink(page?.id || "");
  if (!page || !link) {
    return (
      <Page>
        <EmptyState icon="compass" title="We couldn't find that page">
          <Link href={APP_ROUTES.explore}>See everything Cloudflare can do</Link>
        </EmptyState>
      </Page>
    );
  }
  const group = CATALOG_GROUPS.find((g) => g.id === page.group);
  const related = CATALOG_PAGES.filter((p) => p.group === page.group && p.id !== page.id).slice(0, 8);
  const zoneId = page.scope === "zone" ? site?.id || null : null;

  return (
    <Page>
      <PageHeader icon={pageIcon(page)} color={GROUP_ART[page.group]?.color || "graphite"} title={page.title} subtitle={page.summary} />
      <div className={styles.actions}>
        <LinkButton href={link.dash} external>Open on Cloudflare</LinkButton>
        <Button variant="gray" icon="bubble" onClick={() => navigate(`${APP_ROUTES.home}?ask=${encodeURIComponent(`How do I use ${page.title} on Cloudflare?`)}`)}>Ask about this</Button>
        <LinkButton href={link.docs} external variant="plain" icon="book">Official docs</LinkButton>
        <SidebarToggleButton page={page} />
      </div>
      <p className={styles.where}>
        <Icon name="compass" size={13} /> On Cloudflare it's under <b>{page.cfName.split(" › ").join(" → ")}</b>
      </p>
      <section className={styles.card} aria-label="How to use it">
        <GuideBody pageId={page.id} zoneId={zoneId} />
      </section>
      {related.length > 0 && (
        <section className={styles.related} aria-label={`More in ${group?.title || "this topic"}`}>
          <h2>More in {group?.title}</h2>
          <div className={styles.chips}>
            {related.map((p) => (
              <Link key={p.id} href={p.appRoute || guidePath(p.id)} className={styles.chip}>
                <Icon name={pageIcon(p)} size={13} /> {p.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}

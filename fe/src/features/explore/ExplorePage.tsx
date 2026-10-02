import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { APP_ROUTES } from "@tamely/shared/routes";
import { CATALOG_GROUPS, CATALOG_PAGES, searchCatalog, type CatalogPage } from "@tamely/shared/catalog";
import { EmptyState, Icon, TextField } from "@ui";
import { Composer } from "@features/chat/components/Composer";
import { Page } from "@features/shell/components/Page";
import { PageHeader } from "@features/shell/components/PageHeader";
import styles from "./ExplorePage.module.css";
import { FindBar } from "./components/FindBar";
import { GroupCard } from "./GroupCard";
import { useFindOnPage } from "./hooks/useFindOnPage";
import { PageRow } from "./PageRow";

/** Every Cloudflare feature, explained for non-technical people, as a picture-led masonry of topics. */
export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const results = useMemo(() => (query.trim() ? searchCatalog(query, 30) : null), [query]);
  const open = (p: CatalogPage) => p.appRoute && navigate(p.appRoute);
  const ask = (text: string) => navigate(`${APP_ROUTES.home}?ask=${encodeURIComponent(text)}`);
  const finder = useFindOnPage();
  /* Questions about this page point at the right topics; anything else goes to the assistant. */
  const onQuestion = (text: string) => {
    setQuery("");
    if (!finder.run(text)) ask(text);
  };

  return (
    <>
      <Page size="xl">
        <PageHeader icon="compass" color="graphite" title="Everything else" subtitle="Everything Cloudflare can do, explained simply. Pick a topic." />
        <TextField label="Search" hideLabel placeholder="What do you want to do? Try: block a country, password-protect a page…" value={query} onChange={(e) => { setQuery(e.target.value); finder.clear(); }} suffix={<Icon name="magnifier" size={15} />} />
        {results ? (
          results.length ? (
            <ul className={[styles.pages, styles.results].join(" ")} aria-label="Results">{results.map((p) => <PageRow key={p.id} page={p} onOpen={open} />)}</ul>
          ) : (
            <EmptyState icon="magnifier" title="Nothing found">Try other words, or ask the assistant below.</EmptyState>
          )
        ) : (
          <div className={styles.masonry}>
            {CATALOG_GROUPS.map((g) => (
              <div key={g.id} className={styles.brick}>
                <GroupCard group={g} pages={CATALOG_PAGES.filter((p) => p.group === g.id)} onOpen={open} matched={finder.matched} />
              </div>
            ))}
          </div>
        )}
      </Page>
      <div className={styles.dock}>
        {finder.find && <FindBar find={finder.find} onReveal={finder.reveal} onAsk={() => ask(finder.find!.query)} onClear={finder.clear} />}
        <Composer onSend={onQuestion} onStop={() => {}} busy={false} placeholder="Not sure where to look? Ask, e.g. how do I stop spam on my forms?" />
      </div>
    </>
  );
}

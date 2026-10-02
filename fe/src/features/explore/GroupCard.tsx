import type { CatalogGroup, CatalogPage } from "@tamely/shared/catalog";
import { SCENES } from "@ui";
import { GROUP_ART } from "./art";
import styles from "./ExplorePage.module.css";
import { HomeLinkToggle } from "./components/HomeLinkToggle";
import { PageRow } from "./PageRow";

/** One topic: an animated picture of what it's for, then all its pages in plain words. */
export function GroupCard({ group, pages, onOpen, matched }: { group: CatalogGroup; pages: CatalogPage[]; onOpen: (p: CatalogPage) => void; matched?: Set<string> | null }) {
  const dimmed = !!matched && !pages.some((p) => matched.has(p.id));
  const art = GROUP_ART[group.id];
  const Scene = art ? SCENES[art.scene] : null;
  return (
    <section className={[styles.card, dimmed ? styles.dimmed : ""].join(" ")} aria-label={group.title}>
      {Scene && (
        <div className={styles.art} data-color={art.color}>
          <Scene color={art.color} />
        </div>
      )}
      <div className={styles.cardHead}>
        <div className={styles.cardTitle}>
          <h2>{group.title}</h2>
          <HomeLinkToggle group={group.id} />
        </div>
        <p>{art?.plain || group.blurb}</p>
      </div>
      <ul className={styles.pages}>{pages.map((p) => <PageRow key={p.id} page={p} onOpen={onOpen} highlighted={!!matched?.has(p.id)} />)}</ul>
    </section>
  );
}

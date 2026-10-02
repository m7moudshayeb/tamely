import type { CatalogPage } from "@tamely/shared/catalog";
import { useSidebarLayout } from "@features/shell/hooks/useSidebarLayout";
import { IconButton, useToast } from "@ui";
import styles from "./ExplorePage.module.css";

/** Adds a page to the sidebar, or sends it back here. */
export function PinButton({ page }: { page: CatalogPage }) {
  const sidebar = useSidebarLayout();
  const toast = useToast();
  const { label, locked } = sidebar.target(page);
  if (locked) return null;
  const pinned = sidebar.inSidebar(page);
  const onClick = () => {
    const result = sidebar.toggle(page);
    if (result === "added") toast.show(`${label} is in your sidebar.`);
    if (result === "removed") toast.show(`${label} moved back to Everything else.`);
    if (result === "full") toast.show("Your sidebar is full. Remove a shortcut first.", "info");
  };
  return (
    <IconButton
      className={[styles.pin, pinned ? styles.pinned : ""].join(" ")}
      icon={pinned ? "checkCircle" : "plusCircle"}
      label={pinned ? `Remove ${label} from the sidebar` : `Add ${label} to the sidebar`}
      aria-pressed={pinned}
      size={26}
      iconSize={17}
      onClick={onClick}
    />
  );
}

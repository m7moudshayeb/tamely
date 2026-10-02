import type { CatalogPage } from "@tamely/shared/catalog";
import { Button, useToast } from "@ui";
import { useSidebarLayout } from "../hooks/useSidebarLayout";

/** Labeled "Add to sidebar" / "In sidebar" switch for one Cloudflare page. */
export function SidebarToggleButton({ page }: { page: CatalogPage }) {
  const sidebar = useSidebarLayout();
  const toast = useToast();
  const { label, locked } = sidebar.target(page);
  if (locked) return null;
  const pinned = sidebar.inSidebar(page);
  const onClick = () => {
    const r = sidebar.toggle(page);
    if (r === "added") toast.show(`${label} is in your sidebar.`);
    if (r === "removed") toast.show(`${label} moved back to Everything else.`);
    if (r === "full") toast.show("Your sidebar is full. Remove a link first.", "info");
  };
  return (
    <Button size="sm" variant="plain" icon={pinned ? "checkCircle" : "plusCircle"} aria-pressed={pinned} onClick={onClick}>
      {pinned ? "In your sidebar" : "Add to sidebar"}
    </Button>
  );
}

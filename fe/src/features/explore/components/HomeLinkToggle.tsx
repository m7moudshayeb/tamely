import { GROUP_HOME, navItem } from "@tamely/shared/sidebar";
import { useSidebarLayout } from "@features/shell/hooks/useSidebarLayout";
import { Button, useToast } from "@ui";

/** On a topic card: puts that topic's own Tamely screen (e.g. Speed) back in the sidebar, or takes it out. */
export function HomeLinkToggle({ group }: { group: string }) {
  const sidebar = useSidebarLayout();
  const toast = useToast();
  const path = GROUP_HOME[group];
  const item = path ? navItem(path) : undefined;
  if (!path || !item || item.fixed) return null;
  const shown = !sidebar.layout.hidden.includes(path);
  const toggle = () => {
    if (shown) sidebar.hideNav(path);
    else sidebar.showNav(path);
    toast.show(shown ? `${item.label} moved back to Everything else.` : `${item.label} is back in your sidebar.`);
  };
  return (
    <Button size="sm" variant={shown ? "plain" : "tinted"} icon={shown ? "checkCircle" : "plusCircle"} aria-pressed={shown} aria-label={shown ? `Remove ${item.label} from the sidebar` : `Add ${item.label} to the sidebar`} onClick={toggle}>
      {shown ? "In sidebar" : `Add ${item.label}`}
    </Button>
  );
}

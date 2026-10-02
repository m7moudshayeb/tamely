import { ExternalLink } from "@ui";
import { useDashLink } from "../hooks/useDashLink";
import styles from "./SourceLinks.module.css";

/** "Open on Cloudflare · Docs" pair shown under page titles, so every screen is traceable. */
export function SourceLinks({ pageId }: { pageId: string }) {
  const link = useDashLink(pageId);
  if (!link) return null;
  return (
    <span className={styles.links}>
      <ExternalLink href={link.dash}>Open on Cloudflare</ExternalLink>
      <span aria-hidden>·</span>
      <ExternalLink href={link.docs}>Docs</ExternalLink>
    </span>
  );
}

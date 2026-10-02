import { Link } from "wouter";
import { useChecks } from "@features/connect/hooks/useChecks";
import { Icon } from "@ui";
import styles from "./HomePage.module.css";

/** Nudges people to the setup page when part of their token is missing. */
export function SetupBanner() {
  const q = useChecks(true);
  const failing = (q.data || []).filter((c) => !c.ok);
  if (!failing.length) return null;
  return (
    <Link href="/app/setup" className={styles.banner}>
      <Icon name="exclamation" size={18} />
      <span><b>{failing.length === 1 ? `${failing[0].label} needs a fix.` : `${failing.length} things need a fix.`}</b> See how in Setup & help.</span>
      <Icon name="chevronRight" size={14} weight={2.4} />
    </Link>
  );
}

import { APP_ROUTES } from "@tamely/shared/routes";
import { useSession } from "@shared/hooks/useSession";
import { LinkButton } from "@ui";
import { useChecks } from "../hooks/useChecks";
import { ChecksList } from "./ChecksList";
import styles from "./ConnectGuide.module.css";

/** After connecting: who you are, what works, and the way in. */
export function Connected({ onDone }: { onDone?: () => void }) {
  const session = useSession();
  const checks = useChecks(true);
  return (
    <div className={styles.connected}>
      <p>Connected to <b>{session.data?.account?.name}</b>.</p>
      <ChecksList checks={checks.data} loading={checks.isLoading} />
      <LinkButton href={APP_ROUTES.home} size="lg" trailingIcon="chevronRight" onClick={onDone}>Open Tamely</LinkButton>
    </div>
  );
}

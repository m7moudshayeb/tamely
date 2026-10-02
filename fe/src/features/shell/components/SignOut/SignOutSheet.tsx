import { SIGN_OUT_EVERYWHERE } from "@shared/constants/copy";
import { useDisconnect, useSession } from "@shared/hooks/useSession";
import { Button, Icon, LinkButton, Sheet } from "@ui";
import styles from "./SignOutSheet.module.css";

/** Sign out here, or everywhere by switching Tamely off in Cloudflare. */
export function SignOutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const session = useSession();
  const disconnect = useDisconnect();
  const way = SIGN_OUT_EVERYWHERE[session.data?.method === "oauth" ? "oauth" : "token"];
  const signOut = () => disconnect.mutate(undefined, { onSuccess: onClose });

  return (
    <Sheet open={open} onClose={onClose} title="Sign out" size="sm" subtitle="Tamely keeps nothing on its servers. Your sign-in lives only in this browser and ends by itself after 7 days without use.">
      <div className={styles.options}>
        <section className={styles.option}>
          <span className={styles.icon}><Icon name="appWindow" size={15} /></span>
          <div className={styles.text}>
            <b>This device</b>
            <span>Removes your sign-in from this browser.</span>
          </div>
          <Button size="sm" variant="ink" onClick={signOut} disabled={disconnect.isPending}>Sign out</Button>
        </section>
        <section className={styles.option}>
          <span className={styles.icon}><Icon name="globe" size={15} /></span>
          <div className={styles.text}>
            <b>Every device</b>
            <span>Turns Tamely off in Cloudflare, which signs out all your devices. {way.step}</span>
          </div>
          <LinkButton size="sm" variant="gray" external href={way.href} onClick={signOut}>Sign out everywhere</LinkButton>
        </section>
      </div>
    </Sheet>
  );
}

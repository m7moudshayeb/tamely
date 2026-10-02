import { API } from "@shared/constants/api";
import { LinkButton } from "@ui";
import styles from "./ConnectGuide.module.css";

/** The fast route: approve on Cloudflare's consent screen and come straight back. */
export function SignInWithCloudflare() {
  return (
    <div className={styles.signin}>
      <LinkButton href={API.cloudflareSignIn} variant="filled" size="lg" icon="lock" className={styles.signinBtn}>Sign in with Cloudflare</LinkButton>
      <p>You approve access on Cloudflare, then land right back here. No keys to copy.</p>
    </div>
  );
}

import { ConnectGuide } from "@features/connect/components/ConnectGuide";
import { Logo } from "@ui";
import styles from "./ConnectScreen.module.css";

/** Shown inside /app when no Cloudflare account is connected. */
export function ConnectScreen({ notice }: { notice?: string }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <a href="/"><Logo size={24} /></a>
        <div className={styles.head}>
          <h1>Connect Cloudflare</h1>
          <p>{notice || "Three quick steps. We open Cloudflare with everything filled in."}</p>
        </div>
        <ConnectGuide />
      </div>
    </div>
  );
}

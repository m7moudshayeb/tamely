import { Icon } from "@ui";
import styles from "./CloudflarePreview.module.css";

/** A tiny drawing of Cloudflare's token page, so people know what to look for. */
export function CloudflarePreview() {
  return (
    <figure className={styles.frame} aria-label="What Cloudflare's token page looks like">
      <div className={styles.bar}><i /><i /><i /><span>dash.cloudflare.com</span></div>
      <div className={styles.page}>
        <p className={styles.h}>Create Token</p>
        <div className={styles.row}><span>Token name</span><b>Tamely</b></div>
        <div className={styles.row}><span>Permissions</span><b>13 already filled in</b></div>
        <div className={styles.cta}>
          <span className={styles.pulse}>Continue to summary</span>
          <Icon name="chevronRight" size={14} weight={2.4} />
          <span className={styles.pulse2}>Create Token</span>
          <Icon name="chevronRight" size={14} weight={2.4} />
          <span className={styles.copy}><Icon name="copy" size={14} /> Copy</span>
        </div>
      </div>
      <figcaption className={styles.caption}>Scroll to the bottom, press the two blue buttons, then copy the token.</figcaption>
    </figure>
  );
}

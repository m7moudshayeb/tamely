import { LogoMark, Spinner } from "@ui";
import styles from "./Splash.module.css";

export function Splash() {
  return (
    <div className={styles.splash} aria-busy>
      <LogoMark size={44} />
      <Spinner size={18} label="Loading" />
    </div>
  );
}

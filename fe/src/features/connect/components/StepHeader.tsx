import { Icon } from "@ui";
import styles from "./ConnectGuide.module.css";

export function StepHeader({ n, title, done, active }: { n: number; title: string; done: boolean; active: boolean }) {
  return (
    <div className={[styles.stepHead, active ? styles.activeHead : ""].join(" ")}>
      <span className={[styles.stepNum, done ? styles.stepDone : ""].join(" ")}>{done ? <Icon name="check" size={12} weight={2.8} /> : n}</span>
      <h3 className={styles.stepTitle}>{title}</h3>
    </div>
  );
}

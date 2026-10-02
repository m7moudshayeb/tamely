import styles from "./Bubbles.module.css";

export function UserBubble({ text }: { text: string }) {
  return <p className={styles.user}>{text}</p>;
}

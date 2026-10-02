import { Icon } from "../../icons";
import styles from "./FormError.module.css";

/** Plain-language error under a form. Announced to screen readers. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className={styles.error} role="alert">
      <Icon name="exclamation" size={16} />
      <span>{message}</span>
    </p>
  );
}

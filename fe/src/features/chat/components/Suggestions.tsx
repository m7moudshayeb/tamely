import { SUGGESTIONS } from "@shared/constants/copy";
import { Icon, type IconName } from "@ui";
import styles from "./Suggestions.module.css";

export function Suggestions({ onPick }: { onPick: (text: string) => void }) {
  return (
    <ul className={styles.list} aria-label="Things you can ask">
      {SUGGESTIONS.map((s) => (
        <li key={s.text}>
          <button type="button" className={styles.chip} onClick={() => onPick(s.text)}>
            <Icon name={s.icon as IconName} size={13} />
            <span>{s.text}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

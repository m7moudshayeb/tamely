import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Icon } from "../../icons";
import styles from "./Toast.module.css";

type ToastTone = "good" | "danger" | "info";
interface ToastItem { id: number; tone: ToastTone; text: string }
interface ToastApi { show: (text: string, tone?: ToastTone) => void }

const Ctx = createContext<ToastApi>({ show: () => {} });
const ICON = { good: "checkCircle", danger: "exclamation", info: "info" } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((text: string, tone: ToastTone = "good") => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs.slice(-2), { id, tone, text }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), tone === "danger" ? 7000 : 4200);
  }, []);
  const api = useMemo(() => ({ show }), [show]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className={styles.stack} role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={[styles.toast, styles[t.tone]].join(" ")}>
            <Icon name={ICON[t.tone]} size={18} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);

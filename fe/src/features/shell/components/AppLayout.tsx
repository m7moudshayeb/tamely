import { useState, type ReactNode } from "react";
import { IconButton, Logo } from "@ui";
import styles from "./AppLayout.module.css";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.shell}>
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      {open && <div className={styles.scrim} onClick={() => setOpen(false)} aria-hidden />}
      <div className={styles.main}>
        <header className={styles.mobileBar}>
          <IconButton icon="sidebar" label="Open menu" onClick={() => setOpen(true)} />
          <Logo size={24} />
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useSession, useSwitchAccount } from "@shared/hooks/useSession";
import { IconButton, Icon, Select } from "@ui";
import styles from "./Sidebar.module.css";
import { SignOutSheet } from "./SignOut";

export function AccountMenu() {
  const session = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const switchAccount = useSwitchAccount();
  const accounts = session.data?.accounts || [];
  const account = session.data?.account;
  return (
    <div className={styles.account}>
      <span className={styles.avatar}><Icon name="person" size={13} /></span>
      <div className={styles.accountName}>
        {accounts.length > 1 ? (
          <Select label="Cloudflare account" hideLabel variant="pill" value={account?.id || null} onChange={(id) => switchAccount.mutate(id)} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
        ) : (
          <>
            <b>{account?.name}</b>
            <span>Cloudflare account</span>
          </>
        )}
      </div>
      <IconButton icon="power" label="Sign out" onClick={() => setSigningOut(true)} size={24} />
      <SignOutSheet open={signingOut} onClose={() => setSigningOut(false)} />
    </div>
  );
}

import { buildTokenUrl } from "@tamely/shared/token";
import { useState, type FormEvent } from "react";
import type { ApiFailure } from "@shared/api/errors";
import { useConnect } from "@shared/hooks/useSession";
import { Button, IconButton, LinkButton, TextField } from "@ui";
import { PERMISSION_ROWS } from "../permissions";
import { CloudflarePreview } from "./CloudflarePreview";
import styles from "./ConnectGuide.module.css";
import { StepHeader } from "./StepHeader";

/** The key route: create a pre-filled token, approve and copy it, paste it. */
export function KeySteps() {
  const connect = useConnect();
  const [opened, setOpened] = useState(false);
  const [token, setToken] = useState("");
  const [reveal, setReveal] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const step = token ? 3 : opened ? 2 : 1;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (token.trim()) connect.mutate(token.trim());
  };

  return (
    <div className={styles.steps}>
      <section className={styles.step}>
        <StepHeader n={1} title="Create a key on Cloudflare" done={step > 1} active={step === 1} />
        <div className={styles.stepBody}>
          <p>We open Cloudflare's key page with everything filled in. You only read and approve.</p>
          <div className={styles.actions}>
            <LinkButton href={buildTokenUrl()} external icon="key" onClick={() => setOpened(true)}>Open Cloudflare</LinkButton>
            <Button variant="plain" size="sm" onClick={() => setShowPerms((s) => !s)} aria-expanded={showPerms}>
              {showPerms ? "Hide" : "What can it do?"}
            </Button>
          </div>
          {showPerms && (
            <ul className={styles.perms}>
              {PERMISSION_ROWS.map((p) => (
                <li key={p.name}><b>{p.why}</b><span>{p.name} · {p.access}</span></li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className={styles.step}>
        <StepHeader n={2} title="Approve and copy" done={step > 2} active={step === 2} />
        <div className={styles.stepBody}><CloudflarePreview /></div>
      </section>
      <section className={styles.step}>
        <StepHeader n={3} title="Paste it here" done={false} active={step >= 2} />
        <form className={styles.stepBody} onSubmit={submit}>
          <TextField
            label="Your Cloudflare token"
            hideLabel
            placeholder="Paste your token"
            type={reveal ? "text" : "password"}
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            error={(connect.error as ApiFailure | null)?.message}
            hint="It's encrypted and kept only in a secure cookie in your browser."
            suffix={<IconButton icon="eye" label={reveal ? "Hide token" : "Show token"} size={24} onClick={() => setReveal((r) => !r)} />}
          />
          <Button type="submit" size="lg" block loading={connect.isPending} disabled={!token.trim()}>Connect</Button>
        </form>
      </section>
    </div>
  );
}

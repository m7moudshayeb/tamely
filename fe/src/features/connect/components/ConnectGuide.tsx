import { useState } from "react";
import { useAuthConfig } from "@shared/hooks/useAuthConfig";
import { useSession } from "@shared/hooks/useSession";
import { Button, Skeleton } from "@ui";
import { Connected } from "./Connected";
import styles from "./ConnectGuide.module.css";
import { KeySteps } from "./KeySteps";
import { SignInWithCloudflare } from "./SignInWithCloudflare";

/** One button when "Sign in with Cloudflare" is available; the key steps stay as a fallback. */
export function ConnectGuide({ onDone }: { onDone?: () => void }) {
  const session = useSession();
  const auth = useAuthConfig();
  const [showKey, setShowKey] = useState(false);

  if (session.data?.connected) return <Connected onDone={onDone} />;
  if (auth.isLoading) return <Skeleton height={44} radius={9} />;
  if (!auth.data?.cloudflareSignIn) return <KeySteps />;

  return (
    <div className={styles.guide}>
      <SignInWithCloudflare />
      <div className={styles.or}>
        <Button variant="plain" size="sm" onClick={() => setShowKey((s) => !s)} aria-expanded={showKey} trailingIcon={showKey ? "chevronUp" : "chevronDown"}>
          {showKey ? "Hide the key option" : "Or connect with a key instead"}
        </Button>
      </div>
      {showKey && <KeySteps />}
    </div>
  );
}

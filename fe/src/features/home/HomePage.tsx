import { useEffect, useRef, useState } from "react";
import { BriefingMessage } from "@features/briefing/components/BriefingMessage";
import { ChatThread } from "@features/chat/components/ChatThread";
import { Composer } from "@features/chat/components/Composer";
import { Suggestions } from "@features/chat/components/Suggestions";
import { useChat } from "@features/chat/hooks/useChat";
import { useCurrentSite } from "@shared/context/SiteContext";
import { greeting } from "@shared/lib/format";
import { Button } from "@ui";
import styles from "./HomePage.module.css";
import { SetupBanner } from "./SetupBanner";

/** Chat-first home: greeting, then today's briefing as the first message. */
export default function HomePage() {
  const { site, loading } = useCurrentSite();
  const chat = useChat(site?.id || null);
  const [prefill, setPrefill] = useState<{ text: string; nonce: number } | null>(null);
  const empty = chat.messages.length === 0;
  const ask = (text: string) => setPrefill({ text, nonce: Date.now() });
  const asked = useRef(false);
  /* A question sent from another screen arrives as ?ask=; send it once, then clean the URL. */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("ask");
    if (!q || asked.current || loading) return;
    asked.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    chat.send(q.slice(0, 2000));
  }, [chat, loading]);

  return (
    <div className={styles.home}>
      <section className={styles.chat}>
        <div className={styles.scroll}>
          <SetupBanner />
          <header className={styles.greeting}>
            <h1 className={styles.greet}>{greeting()}</h1>
            <p className={styles.lead}>{site ? <>Here's <b>{site.name}</b> today.</> : "What would you like to do? Ask in your own words."}</p>
          </header>
          {site && <BriefingMessage zoneId={site.id} onAsk={ask} />}
          {empty ? (
            <div className={styles.starters}>
              <p className={styles.startersLabel}>Try asking</p>
              <Suggestions onPick={(t) => chat.send(t)} />
            </div>
          ) : (
            <>
              <ChatThread messages={chat.messages} zoneId={site?.id || null} />
              <div className={styles.threadTools}>
                <Button size="sm" variant="gray" icon="plus" onClick={chat.reset} disabled={chat.busy}>New chat</Button>
              </div>
            </>
          )}
        </div>
        <div className={styles.dock}>
          <Composer onSend={chat.send} onStop={chat.stop} busy={chat.busy} prefill={prefill} placeholder={site ? `Ask anything about ${site.name}` : "Ask anything about Cloudflare"} />
          <p className={styles.fine}>Runs free on Cloudflare AI in your account. Changes wait for your Confirm. Chats clear after 30 quiet minutes.</p>
        </div>
      </section>
    </div>
  );
}

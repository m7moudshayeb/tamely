import styles from "./Logo.module.css";

/** Our mark: one clear route switching back through faint maze walls, Cloudflare's maze tamed. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={styles.mark}>
      <defs>
        <linearGradient id="tm-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--c-ink-raised)" />
          <stop offset="1" stopColor="var(--c-ink)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#tm-tile)" />
      <path d="M7.5 8.5h7M17.5 15.5h7M7.5 23.5h7" stroke="var(--c-accent)" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 12h11.2a3.6 3.6 0 0 1 0 7.2h-5.4a3.6 3.6 0 0 0 0 7.2" fill="none" stroke="var(--c-accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="12" r="2.3" fill="var(--c-surface-raised)" />
    </svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className={styles.logo}>
      <LogoMark size={size} />
      <span className={styles.word}>Tamely</span>
    </span>
  );
}

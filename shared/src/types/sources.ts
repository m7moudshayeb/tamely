export type SourceKind = "app" | "dashboard" | "docs";

/** Every claim the app shows links back to one of these. */
export interface Source {
  title: string;
  href: string;
  kind: SourceKind;
}

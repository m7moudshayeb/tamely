export type CatalogScope = "zone" | "account";

export interface CatalogGroup {
  id: string;
  title: string;
  icon: string;
  blurb: string;
}

export interface CatalogPage {
  id: string;
  group: string;
  title: string;
  cfName: string;
  summary: string;
  scope: CatalogScope;
  /** Path after /:account or /:account/:zone on dash.cloudflare.com */
  path: string;
  docs: string;
  /** In-app screen that already does this, if any */
  appRoute?: string;
  keywords?: string[];
}

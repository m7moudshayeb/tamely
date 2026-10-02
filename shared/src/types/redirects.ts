export interface Redirect {
  rulesetId: string;
  id: string;
  from: string;
  to: string;
  permanent: boolean;
  enabled: boolean;
}

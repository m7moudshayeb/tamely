export interface EmailForward {
  id: string;
  from: string;
  to: string;
  enabled: boolean;
}

export interface EmailInfo {
  enabled: boolean;
  forwards: EmailForward[];
}

/** Shape of every error body the API returns. */
export interface ApiError {
  error: string;
  code?: string;
  fix?: { label: string; href: string };
}

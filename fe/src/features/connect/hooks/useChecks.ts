import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/endpoints";
import { QK } from "@shared/constants/query";

/** Tries each feature once so we can show what works and how to fix the rest. */
export const useChecks = (enabled: boolean) =>
  useQuery({ queryKey: QK.checks, queryFn: api.checks, enabled, staleTime: 5 * 60_000 });

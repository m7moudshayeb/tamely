import { useQuery } from "@tanstack/react-query";
import type { Range } from "@tamely/shared/types";
import { api } from "../api/endpoints";
import { QK } from "../constants/query";

export const useTraffic = (zoneId: string | undefined, range: Range) =>
  useQuery({ queryKey: QK.analytics(zoneId || "", range), queryFn: () => api.analytics(zoneId!, range), enabled: !!zoneId, staleTime: 5 * 60_000 });

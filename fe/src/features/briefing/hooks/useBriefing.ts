import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/endpoints";
import { QK } from "@shared/constants/query";

export const useBriefing = (zoneId: string | undefined) =>
  useQuery({ queryKey: QK.briefing(zoneId || ""), queryFn: () => api.briefing(zoneId!), enabled: !!zoneId, staleTime: 2 * 60_000 });

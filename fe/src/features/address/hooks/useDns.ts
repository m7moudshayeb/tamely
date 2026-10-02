import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/endpoints";
import { QK } from "@shared/constants/query";

export const useDns = (zoneId: string) => useQuery({ queryKey: QK.dns(zoneId), queryFn: () => api.dns(zoneId) });

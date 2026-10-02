import { useQuery } from "@tanstack/react-query";
import { api } from "../api/endpoints";
import { QK } from "../constants/query";

export const useProtection = (zoneId: string) => useQuery({ queryKey: QK.protection(zoneId), queryFn: () => api.protection(zoneId) });

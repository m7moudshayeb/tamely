import { useQuery } from "@tanstack/react-query";
import { api } from "../api/endpoints";
import { QK } from "../constants/query";

export const useSites = (enabled = true) => useQuery({ queryKey: QK.sites, queryFn: api.sites, enabled, staleTime: 60_000 });

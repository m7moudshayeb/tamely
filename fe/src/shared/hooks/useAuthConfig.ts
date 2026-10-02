import { useQuery } from "@tanstack/react-query";
import { api } from "../api/endpoints";
import { QK } from "../constants/query";

/** Whether "Sign in with Cloudflare" is available on this deployment. */
export const useAuthConfig = () => useQuery({ queryKey: QK.authConfig, queryFn: api.authConfig, staleTime: Infinity });

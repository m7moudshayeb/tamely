import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "../api/endpoints";
import { SIGNED_OUT_EVENT } from "../api/errors";
import { QK } from "../constants/query";

/** Clearing the whole cache would detach live session observers, so keep that one query. */
function dropAllButSession(qc: QueryClient) {
  qc.removeQueries({ predicate: (q) => q.queryKey[0] !== QK.session[0] });
}

export function useSession() {
  const qc = useQueryClient();
  useEffect(() => {
    const onOut = () => qc.setQueryData(QK.session, { connected: false });
    window.addEventListener(SIGNED_OUT_EVENT, onOut);
    return () => window.removeEventListener(SIGNED_OUT_EVENT, onOut);
  }, [qc]);
  return useQuery({ queryKey: QK.session, queryFn: api.session, staleTime: 5 * 60_000 });
}

export function useConnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => api.connect(token),
    onSuccess: (info) => {
      dropAllButSession(qc);
      qc.setQueryData(QK.session, info);
    },
  });
}

export function useSwitchAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => api.switchAccount(accountId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.disconnect,
    onSuccess: () => {
      window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
      dropAllButSession(qc);
      qc.setQueryData(QK.session, { connected: false });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Action } from "@tamely/shared/types";
import { useToast } from "@ui";
import { api } from "../api/endpoints";
import type { ApiFailure } from "../api/errors";
import { QK } from "../constants/query";

/** Runs a change from a screen (the click is the confirmation), then refreshes that site. */
export function useAction() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (a: Action) => api.act(a),
    onSuccess: (r, a) => {
      toast.show(r.message, "good");
      qc.invalidateQueries({ queryKey: QK.site(a.zoneId) });
    },
    onError: (e: ApiFailure) => toast.show(e.message, "danger"),
  });
}

/** Runs a signed proposal from the assistant or the briefing. */
export function useConfirmProposal(zoneId?: string | null) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (token: string) => api.confirm(token),
    onSuccess: (r) => {
      toast.show(r.message, "good");
      if (zoneId) qc.invalidateQueries({ queryKey: QK.site(zoneId) });
    },
    onError: (e: ApiFailure) => toast.show(e.message, "danger"),
  });
}

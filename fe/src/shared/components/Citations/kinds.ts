import type { SourceKind } from "@tamely/shared/types";
import type { IconName } from "@ui";

export const KIND: Record<SourceKind, { icon: IconName; label: string }> = {
  app: { icon: "appWindow", label: "In Tamely" },
  dashboard: { icon: "cloud", label: "Cloudflare dashboard" },
  docs: { icon: "book", label: "Cloudflare docs" },
};

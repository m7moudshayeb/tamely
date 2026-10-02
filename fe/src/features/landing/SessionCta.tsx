import { APP_ROUTES } from "@tamely/shared/routes";
import { useSession } from "@shared/hooks/useSession";
import { AppProviders } from "@shared/providers/AppProviders";
import { LinkButton } from "@ui";

interface Props {
  place: "header" | "hero";
}

const COPY = {
  header: { guest: "Connect", member: "Open app" },
  hero: { guest: "Connect in 2 minutes", member: "Open your dashboard" },
} as const;

/** Connect for new visitors; straight into the app for people already connected. */
function Cta({ place }: Props) {
  const session = useSession();
  const member = !!session.data?.connected;
  return (
    <LinkButton
      href={member ? APP_ROUTES.home : "/#connect"}
      variant={place === "header" ? "ink" : "filled"}
      size={place === "header" ? "sm" : "lg"}
      trailingIcon="chevronRight"
    >
      {member ? COPY[place].member : COPY[place].guest}
    </LinkButton>
  );
}

export default function SessionCta(props: Props) {
  return (
    <AppProviders>
      <Cta {...props} />
    </AppProviders>
  );
}

import { useEffect } from "react";
import { SiteProvider } from "@shared/context/SiteContext";
import { useToast } from "@ui";
import { useSession } from "@shared/hooks/useSession";
import { AppProviders } from "@shared/providers/AppProviders";
import { AppLayout } from "./components/AppLayout";
import { ConnectScreen } from "./components/ConnectScreen";
import { Splash } from "./components/Splash";
import { useAuthReturn } from "./hooks/useAuthReturn";
import { AppRoutes } from "./routes";

function Gate() {
  const session = useSession();
  const back = useAuthReturn();
  const toast = useToast();
  const name = session.data?.account?.name;
  useEffect(() => {
    if (back.welcome && name) toast.show(`Connected to ${name}.`, "good");
  }, [back.welcome, name, toast]);
  if (session.isLoading) return <Splash />;
  if (!session.data?.connected) return <ConnectScreen notice={back.error || session.data?.error || (session.error as Error | null)?.message} />;
  return (
    <SiteProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </SiteProvider>
  );
}

/** The signed-in app: one React island with client-side routes under /app. */
export default function App() {
  return (
    <AppProviders>
      <Gate />
    </AppProviders>
  );
}

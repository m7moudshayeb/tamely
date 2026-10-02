import { AppProviders } from "@shared/providers/AppProviders";
import { ConnectGuide } from "./components/ConnectGuide";

/** Standalone island for the landing page. */
export default function ConnectIsland() {
  return (
    <AppProviders>
      <ConnectGuide />
    </AppProviders>
  );
}

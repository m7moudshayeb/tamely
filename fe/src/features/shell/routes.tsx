import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { APP_ROUTES } from "@tamely/shared/routes";
import { Skeleton } from "@ui";
import styles from "./routes.module.css";

const HomePage = lazy(() => import("@features/home/HomePage"));
const VisitorsPage = lazy(() => import("@features/visitors/VisitorsPage"));
const AddressPage = lazy(() => import("@features/address/AddressPage"));
const ProtectionPage = lazy(() => import("@features/protection/ProtectionPage"));
const SpeedPage = lazy(() => import("@features/speed/SpeedPage"));
const EmailPage = lazy(() => import("@features/email/EmailPage"));
const RedirectsPage = lazy(() => import("@features/redirects/RedirectsPage"));
const AppsPage = lazy(() => import("@features/apps/AppsPage"));
const ExplorePage = lazy(() => import("@features/explore/ExplorePage"));
const SetupPage = lazy(() => import("@features/setup/SetupPage"));
const GuidePage = lazy(() => import("@features/guides/GuidePage"));

const Fallback = () => (
  <div className={styles.fallback}>
    <Skeleton height={40} width="40%" />
    <Skeleton height={180} radius={22} />
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Switch>
        <Route path={APP_ROUTES.visitors} component={VisitorsPage} />
        <Route path={APP_ROUTES.address} component={AddressPage} />
        <Route path={APP_ROUTES.protection} component={ProtectionPage} />
        <Route path={APP_ROUTES.speed} component={SpeedPage} />
        <Route path={APP_ROUTES.email} component={EmailPage} />
        <Route path={APP_ROUTES.redirects} component={RedirectsPage} />
        <Route path={APP_ROUTES.apps} component={AppsPage} />
        <Route path={APP_ROUTES.explore} component={ExplorePage} />
        <Route path={APP_ROUTES.setup} component={SetupPage} />
        <Route path={`${APP_ROUTES.guide}/:pageId`} component={GuidePage} />
        <Route component={HomePage} />
      </Switch>
    </Suspense>
  );
}

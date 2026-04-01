import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import CurrentInternetIdentityPanel from "./components/CurrentInternetIdentityPanel";
import FatalErrorBoundary from "./components/FatalErrorBoundary";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import BillsPage from "./pages/bills/BillsPage";
import ContractorsPage from "./pages/contractors/ContractorsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import NMRPage from "./pages/nmr/NMRPage";
import PaymentsPage from "./pages/payments/PaymentsPage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import UsersPage from "./pages/users/UsersPage";
import RootLayout from "./routes/RootLayout";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: RootLayout,
});

// Index route redirects to /dashboard (accessible by all roles)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: ProjectsPage,
});

const contractorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractors",
  component: ContractorsPage,
});

const billsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bills",
  component: BillsPage,
});

const nmrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nmr",
  component: NMRPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payments",
  component: PaymentsPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
  dashboardRoute,
  projectsRoute,
  contractorsRoute,
  billsRoute,
  nmrRoute,
  paymentsRoute,
  analyticsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  return (
    <>
      <RouterProvider router={router} />
      <CurrentInternetIdentityPanel />
    </>
  );
}

export default function App() {
  return (
    <FatalErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AppContent />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </FatalErrorBoundary>
  );
}

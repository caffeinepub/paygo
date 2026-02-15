import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useBootstrapMainAdmin } from './hooks/useQueries';
import LoginPage from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import DeactivatedPage from './pages/Deactivated';
import AppShell from './components/AppShell/AppShell';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ContractorsPage from './pages/contractors/ContractorsPage';
import BillsPage from './pages/bills/BillsPage';
import NMRPage from './pages/nmr/NMRPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
});

const contractorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contractors',
  component: ContractorsPage,
});

const billsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bills',
  component: BillsPage,
});

const nmrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nmr',
  component: NMRPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payments',
  component: PaymentsPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
  projectsRoute,
  contractorsRoute,
  billsRoute,
  nmrRoute,
  paymentsRoute,
  analyticsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const bootstrapMutation = useBootstrapMainAdmin();
  const bootstrapAttemptedRef = useRef(false);

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'initializing';
  const principalId = identity?.getPrincipal().toString();

  // Attempt bootstrap once when authenticated and no profile exists
  useEffect(() => {
    if (
      isAuthenticated &&
      !profileLoading &&
      isFetched &&
      userProfile === null &&
      !bootstrapAttemptedRef.current &&
      !bootstrapMutation.isPending
    ) {
      bootstrapAttemptedRef.current = true;
      bootstrapMutation.mutate(undefined, {
        onError: () => {
          // Bootstrap not eligible (main admin already exists or other error)
          // User will see ProfileSetup screen
        },
      });
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile, bootstrapMutation, principalId]);

  // Reset bootstrap attempt flag when principal changes
  useEffect(() => {
    bootstrapAttemptedRef.current = false;
  }, [principalId]);

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading PayGo...</div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading while fetching profile or attempting bootstrap
  if (profileLoading || !isFetched || bootstrapMutation.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">
            {bootstrapMutation.isPending ? 'Setting up your account...' : 'Loading profile...'}
          </div>
        </div>
      </div>
    );
  }

  // Show profile setup if no profile exists and bootstrap was not successful
  if (userProfile === null && bootstrapAttemptedRef.current && !bootstrapMutation.isSuccess) {
    return <ProfileSetup />;
  }

  // Show deactivated screen if user is not active
  if (userProfile && !userProfile.isActive) {
    return <DeactivatedPage />;
  }

  // Show main app
  return (
    <AppShell>
      <RouterProvider router={router} />
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}

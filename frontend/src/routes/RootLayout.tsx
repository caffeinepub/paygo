import { Outlet } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useLogin } from '../hooks/useQueries';
import AppShell from '../components/AppShell/AppShell';
import GuestModeBanner from '../components/GuestModeBanner';
import ProfileStatusBanner from '../components/ProfileStatusBanner';
import LoginPage from '../pages/Login';
import DeactivatedPage from '../pages/Deactivated';

export default function RootLayout() {
  const { identity, loginStatus, clear } = useInternetIdentity();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check if user is authenticated (non-anonymous principal)
  const isAuthenticated = !!identity && identity.getPrincipal().toString() !== '2vxsx-fae';

  // Only fetch profile when authenticated
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
    error: profileError,
    refetch: refetchProfile,
  } = useGetCallerUserProfile(isAuthenticated);

  const loginMutation = useLogin();
  const hasTriggeredLogin = useRef(false);
  const prevPrincipal = useRef<string | null>(null);

  const isInitializing = loginStatus === 'initializing';
  const principalId = identity?.getPrincipal().toString();

  // When the principal changes, reset the login trigger flag
  useEffect(() => {
    if (principalId !== prevPrincipal.current) {
      prevPrincipal.current = principalId ?? null;
      hasTriggeredLogin.current = false;
    }
  }, [principalId]);

  // Auto-call login() when authenticated but profile is null or not yet registered
  useEffect(() => {
    if (
      isAuthenticated &&
      isFetched &&
      !profileLoading &&
      userProfile === null &&
      !loginMutation.isPending &&
      !loginMutation.isSuccess &&
      !hasTriggeredLogin.current
    ) {
      hasTriggeredLogin.current = true;
      loginMutation.mutate();
    }
  }, [isAuthenticated, isFetched, profileLoading, userProfile, loginMutation.isPending, loginMutation.isSuccess]);

  // Show login modal when requested
  if (showLoginModal) {
    return <LoginPage onClose={() => setShowLoginModal(false)} />;
  }

  // If authenticated and profile is loaded, handle special states
  if (isAuthenticated && isFetched && !profileLoading && !loginMutation.isPending) {
    // Show deactivated screen if user is not active
    if (userProfile && !userProfile.isActive) {
      return <DeactivatedPage />;
    }
  }

  // Determine banner to show
  // Only show banners for: guest mode, initializing II, account setup in progress, or genuine errors
  // Do NOT show a loading banner for normal profile fetching — render content immediately
  let banner: React.ReactNode = undefined;

  if (!isAuthenticated) {
    // Guest mode banner
    banner = <GuestModeBanner onSignIn={() => setShowLoginModal(true)} />;
  } else if (isInitializing) {
    banner = <ProfileStatusBanner variant="loading" message="Initializing Internet Identity..." />;
  } else if (loginMutation.isPending) {
    // Only block with banner when auto-creating a new account
    banner = <ProfileStatusBanner variant="loading" message="Setting up your account..." />;
  } else if (profileError && isFetched && !loginMutation.isPending) {
    // Only show error for genuine unrecoverable errors
    banner = (
      <ProfileStatusBanner
        variant="error"
        message="Unable to load your profile. Please try again or contact your administrator."
        onRetry={() => {
          hasTriggeredLogin.current = false;
          refetchProfile();
        }}
        onLogout={async () => {
          await clear();
        }}
      />
    );
  }

  // Render AppShell with Outlet immediately — no loading screen for profile fetching
  return (
    <AppShell banner={banner}>
      <Outlet />
    </AppShell>
  );
}

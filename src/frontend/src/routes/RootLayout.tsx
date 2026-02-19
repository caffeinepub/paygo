import { Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useBootstrapMainAdmin } from '../hooks/useQueries';
import AppShell from '../components/AppShell/AppShell';
import GuestModeBanner from '../components/GuestModeBanner';
import ProfileStatusBanner from '../components/ProfileStatusBanner';
import LoginPage from '../pages/Login';
import ProfileSetup from '../pages/ProfileSetup';
import DeactivatedPage from '../pages/Deactivated';

export default function RootLayout() {
  const { identity, loginStatus, clear } = useInternetIdentity();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Check if user is authenticated (non-anonymous principal)
  const isAuthenticated = !!identity && identity.getPrincipal().toString() !== '2vxsx-fae';
  
  // Only fetch profile when authenticated
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError, refetch: refetchProfile } = useGetCallerUserProfile(isAuthenticated);
  const bootstrapMutation = useBootstrapMainAdmin();
  const bootstrapAttemptedRef = useRef(false);
  const [bootstrapFailed, setBootstrapFailed] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const isInitializing = loginStatus === 'initializing';
  const principalId = identity?.getPrincipal().toString();

  // Safety timeout to prevent infinite loading (only when authenticated)
  useEffect(() => {
    if (isAuthenticated && (profileLoading || !isFetched)) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isAuthenticated, profileLoading, isFetched]);

  // Attempt bootstrap once when authenticated and no profile exists
  useEffect(() => {
    if (
      isAuthenticated &&
      !profileLoading &&
      isFetched &&
      userProfile === null &&
      !bootstrapAttemptedRef.current &&
      !bootstrapMutation.isPending &&
      !profileError &&
      !bootstrapFailed
    ) {
      bootstrapAttemptedRef.current = true;
      bootstrapMutation.mutate(undefined, {
        onError: (error) => {
          console.error('Bootstrap failed:', error);
          setBootstrapFailed(true);
        },
      });
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile, bootstrapMutation, principalId, profileError, bootstrapFailed]);

  // Reset bootstrap state when principal changes
  useEffect(() => {
    bootstrapAttemptedRef.current = false;
    setBootstrapFailed(false);
    setLoadingTimeout(false);
  }, [principalId]);

  // Show login modal when requested
  if (showLoginModal) {
    return <LoginPage onClose={() => setShowLoginModal(false)} />;
  }

  // If authenticated, handle profile setup and deactivated states (full-screen only for these)
  if (isAuthenticated && isFetched && !profileLoading && !bootstrapMutation.isPending) {
    // Show profile setup if no profile exists and bootstrap was not successful
    if (userProfile === null && (bootstrapFailed || (bootstrapAttemptedRef.current && !bootstrapMutation.isSuccess))) {
      return <ProfileSetup />;
    }

    // Show deactivated screen if user is not active
    if (userProfile && !userProfile.isActive) {
      return <DeactivatedPage />;
    }
  }

  // Determine banner to show
  let banner: React.ReactNode = undefined;

  if (!isAuthenticated) {
    // Guest mode banner
    banner = <GuestModeBanner onSignIn={() => setShowLoginModal(true)} />;
  } else if (isInitializing) {
    // Internet Identity initializing
    banner = <ProfileStatusBanner variant="loading" message="Initializing Internet Identity..." />;
  } else if (profileLoading || !isFetched || bootstrapMutation.isPending) {
    // Profile or bootstrap loading
    const message = bootstrapMutation.isPending ? 'Setting up your account...' : 'Loading profile...';
    banner = <ProfileStatusBanner variant="loading" message={message} />;
  } else if ((profileError && isFetched) || loadingTimeout) {
    // Profile load error or timeout
    banner = (
      <ProfileStatusBanner
        variant="error"
        message="Unable to load your profile. This may happen if your account hasn't been created yet or you don't have the required permissions."
        onRetry={() => refetchProfile()}
        onLogout={async () => {
          await clear();
          // Query cache will be cleared by useInternetIdentity hook
        }}
      />
    );
  }

  // Render AppShell with Outlet for nested routes
  return (
    <AppShell banner={banner}>
      <Outlet />
    </AppShell>
  );
}

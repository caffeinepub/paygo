import { Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
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
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const isInitializing = loginStatus === 'initializing';
  const principalId = identity?.getPrincipal().toString();

  // Comprehensive logging for profile loading flow
  useEffect(() => {
    console.log('[RootLayout Profile Flow] State update:', {
      timestamp: new Date().toISOString(),
      isAuthenticated,
      principalId,
      profileLoading,
      isFetched,
      profileError: profileError ? String(profileError) : null,
      userProfile: userProfile ? 'exists' : userProfile === null ? 'null' : 'undefined',
      loadingTimeout,
      loginStatus,
    });
  }, [isAuthenticated, principalId, profileLoading, isFetched, profileError, userProfile, loadingTimeout, loginStatus]);

  // Safety timeout to prevent infinite loading (only when authenticated)
  useEffect(() => {
    if (isAuthenticated && (profileLoading || !isFetched)) {
      console.log('[RootLayout Profile Flow] Starting 15-second timeout timer');
      const timer = setTimeout(() => {
        console.log('[RootLayout Profile Flow] TIMEOUT REACHED - Profile loading exceeded 15 seconds');
        setLoadingTimeout(true);
      }, 15000); // 15 second timeout (increased from 10)
      return () => {
        console.log('[RootLayout Profile Flow] Clearing timeout timer');
        clearTimeout(timer);
      };
    } else {
      if (loadingTimeout) {
        console.log('[RootLayout Profile Flow] Resetting timeout flag');
      }
      setLoadingTimeout(false);
    }
  }, [isAuthenticated, profileLoading, isFetched]);

  // Reset loading timeout when principal changes
  useEffect(() => {
    if (principalId) {
      console.log('[RootLayout Profile Flow] Principal changed, resetting timeout:', principalId);
    }
    setLoadingTimeout(false);
  }, [principalId]);

  // Log authentication state changes
  useEffect(() => {
    console.log('[RootLayout Profile Flow] Authentication state changed:', {
      isAuthenticated,
      principalId,
      loginStatus,
    });
  }, [isAuthenticated, principalId, loginStatus]);

  // Show login modal when requested
  if (showLoginModal) {
    return <LoginPage onClose={() => setShowLoginModal(false)} />;
  }

  // If authenticated, handle profile setup and deactivated states (full-screen only for these)
  if (isAuthenticated && isFetched && !profileLoading) {
    console.log('[RootLayout Profile Flow] Profile fetch completed:', {
      userProfile: userProfile ? 'exists' : userProfile === null ? 'null' : 'undefined',
      isActive: userProfile?.isActive,
    });

    // Show profile setup if no profile exists
    if (userProfile === null) {
      console.log('[RootLayout Profile Flow] Rendering ProfileSetup (no profile exists)');
      return <ProfileSetup />;
    }

    // Show deactivated screen if user is not active
    if (userProfile && !userProfile.isActive) {
      console.log('[RootLayout Profile Flow] Rendering DeactivatedPage (user not active)');
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
    console.log('[RootLayout Profile Flow] Showing initializing banner');
    banner = <ProfileStatusBanner variant="loading" message="Initializing Internet Identity..." />;
  } else if (profileLoading || !isFetched) {
    // Profile loading
    console.log('[RootLayout Profile Flow] Showing profile loading banner');
    banner = <ProfileStatusBanner variant="loading" message="Loading profile..." />;
  } else if ((profileError && isFetched) || loadingTimeout) {
    // Profile load error or timeout
    console.log('[RootLayout Profile Flow] Showing error banner:', {
      hasError: !!profileError,
      errorMessage: profileError ? String(profileError) : null,
      loadingTimeout,
    });
    banner = (
      <ProfileStatusBanner
        variant="error"
        message={
          loadingTimeout
            ? "Profile loading timed out after 15 seconds. This may indicate a connection issue or the backend is not responding. Please try again or contact support if the problem persists."
            : "Unable to load your profile. This may happen if your account hasn't been created yet or you don't have the required permissions."
        }
        onRetry={() => {
          console.log('[RootLayout Profile Flow] Retry button clicked');
          setLoadingTimeout(false);
          refetchProfile();
        }}
        onLogout={async () => {
          console.log('[RootLayout Profile Flow] Logout button clicked');
          await clear();
          // Query cache will be cleared by useInternetIdentity hook
        }}
      />
    );
  }

  console.log('[RootLayout Profile Flow] Rendering AppShell with banner:', banner ? 'yes' : 'no');

  // Render AppShell with Outlet for nested routes
  return (
    <AppShell banner={banner}>
      <Outlet />
    </AppShell>
  );
}

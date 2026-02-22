import { useState } from 'react';
import { useGetCallerUserProfile, useCompletePendingUserSetup } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CurrentInternetIdentityPanel from '../components/CurrentInternetIdentityPanel';
import { toast } from 'sonner';
import { Info } from 'lucide-react';

const BOOTSTRAP_ADMIN_EMAIL = 'jogaraoseri.er@mktconstructions.com';

export default function ProfileSetup() {
  const { identity } = useInternetIdentity();
  const { refetch } = useGetCallerUserProfile();
  const completePendingSetupMutation = useCompletePendingUserSetup();

  const handleContinue = async () => {
    if (!identity) {
      toast.error('Identity not available');
      return;
    }

    try {
      // Call completePendingUserSetup which handles both bootstrap admin and pre-created users
      await completePendingSetupMutation.mutateAsync();
      toast.success('Profile setup completed successfully');
      refetch();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to complete profile setup';
      if (errorMessage.includes('No pending user setup found')) {
        toast.error('Your account must be created by an administrator. Please contact support.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const isPending = completePendingSetupMutation.isPending;

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to PayGo</CardTitle>
            <CardDescription>Complete your profile setup to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> User accounts must be created by an administrator before you can log in.
                The main admin email <strong>{BOOTSTRAP_ADMIN_EMAIL}</strong> can self-register on first login.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Click the button below to complete your profile setup. Your account information has been pre-configured by an administrator.
              </p>
              <Button onClick={handleContinue} className="w-full" disabled={isPending}>
                {isPending ? 'Setting up profile...' : 'Complete Profile Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <CurrentInternetIdentityPanel />
    </>
  );
}

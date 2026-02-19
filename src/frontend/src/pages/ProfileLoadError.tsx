import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CurrentInternetIdentityPanel from '../components/CurrentInternetIdentityPanel';
import { AlertCircle } from 'lucide-react';

export default function ProfileLoadError() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Unable to Load Profile</CardTitle>
            <CardDescription className="text-base">
              We couldn't load your user profile. This may happen if:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>Your account hasn't been created yet</li>
              <li>You don't have the required permissions</li>
              <li>The system is still initializing</li>
            </ul>
            <div className="pt-2">
              <Button
                onClick={handleLogout}
                variant="default"
                className="w-full"
                size="lg"
              >
                Logout and Try Again
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              If this problem persists, please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
      <CurrentInternetIdentityPanel />
    </>
  );
}

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface GuestModeBannerProps {
  onSignIn: () => void;
}

export default function GuestModeBanner({ onSignIn }: GuestModeBannerProps) {
  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm text-blue-900">
          You are browsing in guest mode. Sign in to access full features and manage your billing data.
        </span>
        <Button onClick={onSignIn} size="sm" className="ml-4 shrink-0">
          Sign In
        </Button>
      </AlertDescription>
    </Alert>
  );
}

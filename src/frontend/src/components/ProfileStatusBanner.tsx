import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Info } from 'lucide-react';

interface ProfileStatusBannerProps {
  variant: 'loading' | 'error' | 'info';
  message: string;
  onRetry?: () => void;
  onLogout?: () => void;
}

export default function ProfileStatusBanner({ variant, message, onRetry, onLogout }: ProfileStatusBannerProps) {
  const getIcon = () => {
    switch (variant) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertClassName = () => {
    switch (variant) {
      case 'loading':
        return 'mb-6 border-blue-200 bg-blue-50';
      case 'error':
        return 'mb-6 border-destructive/50 bg-destructive/10';
      case 'info':
        return 'mb-6 border-blue-200 bg-blue-50';
    }
  };

  const getTextClassName = () => {
    switch (variant) {
      case 'loading':
        return 'text-sm text-blue-900';
      case 'error':
        return 'text-sm text-destructive';
      case 'info':
        return 'text-sm text-blue-900';
    }
  };

  return (
    <Alert className={getAlertClassName()}>
      {getIcon()}
      <AlertDescription className="flex items-center justify-between">
        <span className={getTextClassName()}>{message}</span>
        {variant === 'error' && (onRetry || onLogout) && (
          <div className="ml-4 flex shrink-0 gap-2">
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                Retry
              </Button>
            )}
            {onLogout && (
              <Button onClick={onLogout} size="sm" variant="destructive">
                Logout
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

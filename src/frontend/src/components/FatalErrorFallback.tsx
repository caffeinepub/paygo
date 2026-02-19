import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FatalErrorFallbackProps {
  error?: Error;
}

export default function FatalErrorFallback({ error }: FatalErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            The application encountered an unexpected error and needs to reload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2 text-sm">
              {error?.message || 'An unknown error occurred'}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleReload} className="w-full">
            Reload Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

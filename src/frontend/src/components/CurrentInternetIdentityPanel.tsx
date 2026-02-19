import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function CurrentInternetIdentityPanel() {
  const { identity } = useInternetIdentity();

  const principal = identity?.getPrincipal().toString() || 'Anonymous';
  const isAnonymous = !identity;

  const handleCopy = async () => {
    if (isAnonymous) return;

    try {
      await navigator.clipboard.writeText(principal);
      toast.success('Principal copied');
    } catch (error) {
      toast.error('Failed to copy principal');
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-md border-2 border-primary/20 bg-background/95 p-3 shadow-lg backdrop-blur">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Current Internet Identity
          </div>
          <div className="text-xs font-mono break-all text-foreground">
            {principal}
          </div>
        </div>
        {!isAnonymous && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCopy}
            title="Copy principal"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

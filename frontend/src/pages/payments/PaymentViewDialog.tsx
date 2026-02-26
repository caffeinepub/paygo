import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../lib/formatters/currency';
import type { Payment } from '../../backend';

interface PaymentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export default function PaymentViewDialog({ open, onOpenChange, payment }: PaymentViewDialogProps) {
  if (!payment) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default">Completed</Badge>;
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Partial':
        return <Badge variant="outline">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Payment ID</Label>
            <p className="font-mono text-sm">{payment.paymentId}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Bill Number</Label>
            <p className="font-medium">{payment.billNumber}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project</Label>
              <p>{payment.project}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contractor</Label>
              <p>{payment.contractor}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Payment Date</Label>
            <p>{payment.paymentDate}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Bill Total</Label>
              <p className="font-semibold">{formatCurrency(payment.billTotal)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Paid Amount</Label>
              <p className="font-semibold text-green-700">{formatCurrency(payment.paidAmount)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Balance</Label>
              <p className="font-semibold">{formatCurrency(payment.balance)}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">{getStatusBadge(payment.status)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

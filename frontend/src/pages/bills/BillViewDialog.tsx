import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../lib/formatters/currency';

interface BillViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any | null;
}

export default function BillViewDialog({ open, onOpenChange, bill }: BillViewDialogProps) {
  if (!bill) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending PM':
        return <Badge variant="secondary">Pending PM</Badge>;
      case 'Pending QC':
        return <Badge variant="secondary">Pending QC</Badge>;
      case 'Pending Billing':
        return <Badge variant="secondary">Pending Billing</Badge>;
      case 'Approved':
        return <Badge variant="default">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bill Details</DialogTitle>
          <DialogDescription>View complete bill information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Bill Number</Label>
              <p className="font-mono text-sm">{bill.billNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(bill.status)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Contractor</Label>
              <p>{bill.contractor}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Project</Label>
              <p>{bill.project}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project Date</Label>
              <p>{bill.projectDate}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Trade</Label>
              <p>{bill.trade}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Unit</Label>
              <p>{bill.unit}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Unit Price</Label>
              <p>{formatCurrency(bill.unitPrice)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Quantity</Label>
              <p>{bill.quantity}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Total</Label>
            <p className="text-lg font-semibold">{formatCurrency(bill.total)}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="text-sm">{bill.description || 'N/A'}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Location</Label>
            <p className="text-sm">{bill.location || 'N/A'}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Authorized Engineer</Label>
            <p>{bill.authorizedEngineer}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Approval Details</h3>
            
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">PM Approval</Label>
                  <Badge variant={bill.pmApproved ? 'default' : 'secondary'}>
                    {bill.pmApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                {bill.pmDebit > 0 && (
                  <p className="text-sm">Debit: {formatCurrency(bill.pmDebit)}</p>
                )}
                {bill.pmNote && (
                  <p className="text-sm text-muted-foreground">Note: {bill.pmNote}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">QC Approval</Label>
                  <Badge variant={bill.qcApproved ? 'default' : 'secondary'}>
                    {bill.qcApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                {bill.qcDebit > 0 && (
                  <p className="text-sm">Debit: {formatCurrency(bill.qcDebit)}</p>
                )}
                {bill.qcNote && (
                  <p className="text-sm text-muted-foreground">Note: {bill.qcNote}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">Billing Approval</Label>
                  <Badge variant={bill.billingApproved ? 'default' : 'secondary'}>
                    {bill.billingApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-muted-foreground">Final Amount</Label>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(bill.finalAmount)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

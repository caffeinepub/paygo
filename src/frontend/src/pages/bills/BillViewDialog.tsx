import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../lib/formatters/currency';
import { formatDate } from '../../lib/dates';
import type { Bill } from '../../backend';

interface BillViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
}

export default function BillViewDialog({ open, onOpenChange, bill }: BillViewDialogProps) {
  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bill Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Bill Number</Label>
              <p className="font-mono font-bold">{bill.billNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge variant={bill.status === 'Completed' ? 'default' : 'secondary'}>
                  {bill.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project</Label>
              <p>{bill.project}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contractor</Label>
              <p>{bill.contractor}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Project Date</Label>
            <p>{formatDate(bill.projectDate)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Trade</Label>
              <p>{bill.trade}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Unit</Label>
              <p>{bill.unit}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Unit Price</Label>
              <p>{formatCurrency(bill.unitPrice)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Quantity</Label>
              <p>{bill.quantity}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total</Label>
              <p className="font-semibold">{formatCurrency(bill.total)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">PM Debit</Label>
              <p>{formatCurrency(bill.pmDebit)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">QC Debit</Label>
              <p>{formatCurrency(bill.qcDebit)}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Final Amount</Label>
            <p className="text-lg font-bold">{formatCurrency(bill.finalAmount)}</p>
          </div>
          {bill.description && (
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="whitespace-pre-wrap">{bill.description}</p>
            </div>
          )}
          {bill.location && (
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <p>{bill.location}</p>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Authorized Engineer</Label>
            <p>{bill.authorizedEngineer}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

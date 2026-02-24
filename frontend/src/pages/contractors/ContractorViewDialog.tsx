import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '../../lib/formatters/currency';

interface ContractorViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: any | null;
}

export default function ContractorViewDialog({ open, onOpenChange, contractor }: ContractorViewDialogProps) {
  if (!contractor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contractor Details</DialogTitle>
          <DialogDescription>View complete contractor information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">ID</Label>
              <p className="font-mono text-sm">{contractor.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Date</Label>
              <p>{contractor.date}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Contractor Name</Label>
            <p className="font-semibold">{contractor.contractorName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project</Label>
              <p>{contractor.project}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Trade</Label>
              <p>{contractor.trade}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Unit</Label>
              <p>{contractor.unit}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Unit Price</Label>
              <p>{formatCurrency(contractor.unitPrice)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Estimated Qty</Label>
              <p>{contractor.estimatedQty}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Estimated Amount</Label>
            <p className="text-lg font-semibold">{formatCurrency(contractor.estimatedAmount)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Mobile</Label>
              <p>{contractor.mobile || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p>{contractor.email || 'N/A'}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Address</Label>
            <p className="text-sm">{contractor.address || 'N/A'}</p>
          </div>

          {contractor.attachments && contractor.attachments.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Attachments</Label>
              <div className="mt-2 space-y-1">
                {contractor.attachments.map((attachment: string, index: number) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:underline"
                  >
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

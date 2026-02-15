import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useListProjects } from '../../hooks/useQueries';
import { formatCurrency } from '../../lib/formatters/currency';
import { formatDate } from '../../lib/dates';
import type { Contractor } from '../../backend';

interface ContractorViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: Contractor | null;
}

export default function ContractorViewDialog({ open, onOpenChange, contractor }: ContractorViewDialogProps) {
  const { data: projects = [] } = useListProjects();

  if (!contractor) return null;

  const project = projects.find((p) => p.id === contractor.project);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Contractor Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Date</Label>
              <p>{formatDate(contractor.date)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Project</Label>
              <p>{project?.projectName || contractor.project}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Contractor Name</Label>
            <p className="font-medium">{contractor.contractorName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Trade</Label>
              <p>{contractor.trade}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Unit</Label>
              <p>{contractor.unit}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Unit Price</Label>
              <p className="font-semibold">{formatCurrency(contractor.unitPrice)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Estimated Qty</Label>
              <p>{contractor.estimatedQty}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Estimated Amount</Label>
            <p className="text-lg font-bold">{formatCurrency(contractor.estimatedAmount)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Mobile</Label>
              <p>{contractor.mobile}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p>{contractor.email}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Address</Label>
            <p className="whitespace-pre-wrap">{contractor.address}</p>
          </div>
          {contractor.attachments.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Attachments</Label>
              <ul className="mt-2 space-y-1">
                {contractor.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Attachment {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

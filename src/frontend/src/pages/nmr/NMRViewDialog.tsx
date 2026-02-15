import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '../../lib/formatters/currency';
import type { NMR } from '../../backend';

interface NMRViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nmr: NMR | null;
}

export default function NMRViewDialog({ open, onOpenChange, nmr }: NMRViewDialogProps) {
  if (!nmr) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>NMR Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project</Label>
              <p>{nmr.project}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contractor</Label>
              <p>{nmr.contractor}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Week Start</Label>
              <p>{nmr.weekStartDate}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Week End</Label>
              <p>{nmr.weekEndDate}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Engineer Name</Label>
            <p>{nmr.engineerName}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge variant={nmr.status === 'Completed' ? 'default' : 'secondary'}>
                {nmr.status}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Final Amount</Label>
            <p className="text-lg font-bold">{formatCurrency(nmr.finalAmount)}</p>
          </div>
          <div>
            <Label className="text-base font-semibold">Entries</Label>
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Labour Type</TableHead>
                  <TableHead>Persons</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Duty</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nmr.entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.labourType}</TableCell>
                    <TableCell>{entry.noOfPersons}</TableCell>
                    <TableCell>{formatCurrency(entry.rate)}</TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell>{entry.duty}</TableCell>
                    <TableCell>{formatCurrency(entry.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '../../lib/formatters/currency';

interface NMRViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nmr: any | null;
}

export default function NMRViewDialog({ open, onOpenChange, nmr }: NMRViewDialogProps) {
  if (!nmr) return null;

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

  const totalAmount = nmr.entries.reduce((sum: number, entry: any) => sum + entry.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>NMR Details</DialogTitle>
          <DialogDescription>View complete NMR information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">ID</Label>
              <p className="font-mono text-sm">{nmr.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(nmr.status)}</div>
            </div>
          </div>

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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Trade</Label>
              <p>{nmr.trade}</p>
            </div>
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
            <Label className="text-muted-foreground mb-2 block">Entries</Label>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Labour Type</TableHead>
                    <TableHead>No. of Persons</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Duty</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nmr.entries.map((entry: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.labourType}</TableCell>
                      <TableCell>{entry.noOfPersons}</TableCell>
                      <TableCell>{formatCurrency(entry.rate)}</TableCell>
                      <TableCell>{entry.hours}</TableCell>
                      <TableCell>{entry.duty}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(entry.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-semibold">
                    <TableCell colSpan={6} className="text-right">Total:</TableCell>
                    <TableCell>{formatCurrency(totalAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Approval Details</h3>
            
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">PM Approval</Label>
                  <Badge variant={nmr.pmApproved ? 'default' : 'secondary'}>
                    {nmr.pmApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                {nmr.pmDebit > 0 && (
                  <p className="text-sm">Debit: {formatCurrency(nmr.pmDebit)}</p>
                )}
                {nmr.pmNote && (
                  <p className="text-sm text-muted-foreground">Note: {nmr.pmNote}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">QC Approval</Label>
                  <Badge variant={nmr.qcApproved ? 'default' : 'secondary'}>
                    {nmr.qcApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                {nmr.qcDebit > 0 && (
                  <p className="text-sm">Debit: {formatCurrency(nmr.qcDebit)}</p>
                )}
                {nmr.qcNote && (
                  <p className="text-sm text-muted-foreground">Note: {nmr.qcNote}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">Billing Approval</Label>
                  <Badge variant={nmr.billingApproved ? 'default' : 'secondary'}>
                    {nmr.billingApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-muted-foreground">Final Amount</Label>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(nmr.finalAmount)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

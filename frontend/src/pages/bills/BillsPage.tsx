import { useState, useMemo } from 'react';
import { useListBills, useDeleteBill, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Plus } from 'lucide-react';
import BillFormDialog from './BillFormDialog';
import BillViewDialog from './BillViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { canDelete, canRaiseBill, isViewer } from '../../lib/roleAccess';
import { formatCurrency } from '../../lib/formatters/currency';
import { toast } from 'sonner';

export default function BillsPage() {
  const { data: bills = [], isLoading } = useListBills();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteBill();

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const canUserRaise = currentUser && canRaiseBill(currentUser.role);
  const isViewerRole = currentUser && isViewer(currentUser.role);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => b.billNumber.localeCompare(a.billNumber));
  }, [bills]);

  const handleView = (bill: any) => {
    setSelectedBill(bill);
    setViewOpen(true);
  };

  const handleDelete = (bill: any) => {
    setSelectedBill(bill);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedBill) return;

    try {
      await deleteMutation.mutateAsync({
        billId: selectedBill.id,
        password,
      });
      toast.success('Bill deleted successfully');
      setDeleteOpen(false);
      setSelectedBill(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bill');
    }
  };

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

  if (isLoading) {
    return <div className="p-6">Loading bills...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Bills</h1>
        {canUserRaise && !isViewerRole && (
          <Button onClick={() => { setSelectedBill(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Raise Bill
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedBills.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No bills found. {canUserRaise && !isViewerRole && 'Click "Raise Bill" to create one.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBills.map((bill, index) => (
                  <TableRow key={bill.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-mono text-xs">{bill.billNumber}</TableCell>
                    <TableCell>{bill.contractor}</TableCell>
                    <TableCell>{bill.project}</TableCell>
                    <TableCell>{bill.trade}</TableCell>
                    <TableCell>{bill.quantity} {bill.unit}</TableCell>
                    <TableCell>{formatCurrency(bill.total)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(bill.finalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(bill.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(bill)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canUserDelete && !isViewerRole && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(bill)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BillFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <BillViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        bill={selectedBill}
      />

      <DeleteWithPasswordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Bill"
        description="Are you sure you want to delete this bill? This action cannot be undone."
      />
    </div>
  );
}

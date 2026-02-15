import { useState } from 'react';
import { useListBills, useDeleteBill, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import BillFormDialog from './BillFormDialog';
import BillViewDialog from './BillViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { formatCurrency } from '../../lib/formatters/currency';
import { canDelete, canRaiseBill, isViewer } from '../../lib/roleAccess';
import { toast } from 'sonner';
import type { Bill } from '../../backend';

export default function BillsPage() {
  const { data: bills = [], isLoading } = useListBills();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteBill();

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const canUserRaise = currentUser && canRaiseBill(currentUser.role);
  const isViewerRole = currentUser && isViewer(currentUser.role);

  const handleView = (bill: Bill) => {
    setSelectedBill(bill);
    setViewOpen(true);
  };

  const handleDelete = (bill: Bill) => {
    setSelectedBill(bill);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedBill) return;

    try {
      await deleteMutation.mutateAsync({
        id: selectedBill.id,
        password,
      });
      toast.success('Bill deleted successfully');
      setDeleteOpen(false);
      setSelectedBill(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bill');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading bills...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Bills</h1>
        {canUserRaise && (
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Number</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Final Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill, index) => (
                <TableRow key={bill.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <TableCell className="font-mono font-medium">{bill.billNumber}</TableCell>
                  <TableCell>{bill.project}</TableCell>
                  <TableCell>{bill.contractor}</TableCell>
                  <TableCell>{formatCurrency(bill.total)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(bill.finalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={bill.status === 'Completed' ? 'default' : 'secondary'}>
                      {bill.status}
                    </Badge>
                  </TableCell>
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
                      {canUserDelete && (
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

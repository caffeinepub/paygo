import { useState, useMemo } from 'react';
import { useListPayments, useDeletePayment, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Plus } from 'lucide-react';
import PaymentFormDialog from './PaymentFormDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { canDelete } from '../../lib/roleAccess';
import { formatCurrency } from '../../lib/formatters/currency';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const { data: payments = [], isLoading } = useListPayments();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeletePayment();

  const canUserDelete = currentUser && canDelete(currentUser.role);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => b.paymentId.localeCompare(a.paymentId));
  }, [payments]);

  const handleDelete = (payment: any) => {
    setSelectedPayment(payment);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedPayment) return;

    try {
      await deleteMutation.mutateAsync({
        paymentId: selectedPayment.id,
        password,
      });
      toast.success('Payment deleted successfully');
      setDeleteOpen(false);
      setSelectedPayment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="default">Paid</Badge>;
      case 'Partial':
        return <Badge variant="secondary">Partial</Badge>;
      case 'Pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <Button onClick={() => { setSelectedPayment(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No payments found. Click "Record Payment" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Bill Total</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment, index) => (
                  <TableRow key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-mono text-xs">{payment.paymentId}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.billNumber}</TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>{payment.project}</TableCell>
                    <TableCell>{payment.contractor}</TableCell>
                    <TableCell>{formatCurrency(payment.billTotal)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(payment.paidAmount)}</TableCell>
                    <TableCell className={payment.balance > 0 ? 'text-orange-600 font-medium' : ''}>
                      {formatCurrency(payment.balance)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUserDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(payment)}
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

      <PaymentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <DeleteWithPasswordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment"
        description="Are you sure you want to delete this payment? This action cannot be undone."
      />
    </div>
  );
}

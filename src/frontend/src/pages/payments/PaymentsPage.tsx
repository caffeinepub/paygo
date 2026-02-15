import { useState } from 'react';
import { useListPayments, useDeletePayment, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import PaymentFormDialog from './PaymentFormDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { formatCurrency } from '../../lib/formatters/currency';
import { formatDate } from '../../lib/dates';
import { canDelete, isViewer } from '../../lib/roleAccess';
import { toast } from 'sonner';
import type { Payment } from '../../backend';

export default function PaymentsPage() {
  const { data: payments = [], isLoading } = useListPayments();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeletePayment();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const isViewerRole = currentUser && isViewer(currentUser.role);

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedPayment) return;

    try {
      await deleteMutation.mutateAsync({
        id: selectedPayment.id,
        password,
      });
      toast.success('Payment deleted successfully');
      setDeleteOpen(false);
      setSelectedPayment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        {!isViewerRole && (
          <Button onClick={() => { setSelectedPayment(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Bill Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => (
                <TableRow key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <TableCell className="font-mono">{payment.paymentId}</TableCell>
                  <TableCell className="font-mono">{payment.billNumber}</TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>{payment.project}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(payment.paidAmount)}</TableCell>
                  <TableCell>{formatCurrency(payment.balance)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === 'Completed'
                          ? 'default'
                          : payment.status === 'Partially Paid'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
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

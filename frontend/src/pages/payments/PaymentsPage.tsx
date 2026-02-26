import { useState, useMemo } from 'react';
import { useListPayments, useDeletePayment, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import PaymentFormDialog from './PaymentFormDialog';
import PaymentViewDialog from './PaymentViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { canDelete, canApproveBilling } from '../../lib/roleAccess';
import { formatCurrency } from '../../lib/formatters/currency';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const { data: payments = [], isLoading, isError, error, refetch } = useListPayments();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeletePayment();

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const canUserCreatePayment = currentUser && canApproveBilling(currentUser.role);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => b.paymentId.localeCompare(a.paymentId));
  }, [payments]);

  const handleView = (payment: any) => {
    setSelectedPayment(payment);
    setViewOpen(true);
  };

  const handleDelete = (payment: any) => {
    setSelectedPayment(payment);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedPayment) return;
    try {
      await deleteMutation.mutateAsync({ paymentId: selectedPayment.id, password });
      toast.success('Payment deleted successfully');
      setDeleteOpen(false);
      setSelectedPayment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default">Completed</Badge>;
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Partial':
        return <Badge variant="outline">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading payments...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-destructive font-medium">Failed to load payments</p>
            <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        {canUserCreatePayment && (
          <Button
            onClick={() => {
              setSelectedPayment(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No payments found. {canUserCreatePayment && 'Click "Record Payment" to create one.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Payment Date</TableHead>
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
                    <TableCell>{payment.billNumber}</TableCell>
                    <TableCell>{payment.project}</TableCell>
                    <TableCell>{payment.contractor}</TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>{formatCurrency(payment.billTotal)}</TableCell>
                    <TableCell className="font-semibold text-green-700">
                      {formatCurrency(payment.paidAmount)}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.balance)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(payment)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canUserDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(payment)} title="Delete">
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

      <PaymentFormDialog open={formOpen} onOpenChange={setFormOpen} />
      {selectedPayment && (
        <PaymentViewDialog open={viewOpen} onOpenChange={setViewOpen} payment={selectedPayment} />
      )}
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

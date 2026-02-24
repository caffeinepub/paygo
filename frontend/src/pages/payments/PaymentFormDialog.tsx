import { useState, useMemo } from 'react';
import { useCreatePayment, useListBills } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '../../lib/formatters/currency';
import { toast } from 'sonner';

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentFormDialog({ open, onOpenChange }: PaymentFormDialogProps) {
  const { data: bills = [] } = useListBills();
  const createMutation = useCreatePayment();

  const [billNumber, setBillNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidAmount, setPaidAmount] = useState('');

  const approvedBills = useMemo(() => {
    return bills.filter((b) => b.billingApproved && b.status === 'Completed');
  }, [bills]);

  const selectedBill = approvedBills.find((b) => b.billNumber === billNumber);

  const balance = selectedBill ? selectedBill.finalAmount - parseFloat(paidAmount || '0') : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(paidAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (selectedBill && amount > selectedBill.finalAmount) {
      toast.error('Payment amount cannot exceed bill total');
      return;
    }

    try {
      await createMutation.mutateAsync({
        billNumber,
        paymentDate,
        paidAmount: amount,
      });
      toast.success('Payment created successfully');
      onOpenChange(false);
      // Reset form
      setBillNumber('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaidAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>Record a new payment for an approved bill</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billNumber">Bill Number</Label>
            <Select value={billNumber} onValueChange={setBillNumber} required>
              <SelectTrigger id="billNumber">
                <SelectValue placeholder="Select approved bill" />
              </SelectTrigger>
              <SelectContent>
                {approvedBills.map((bill) => (
                  <SelectItem key={bill.id} value={bill.billNumber}>
                    {bill.billNumber} - {formatCurrency(bill.finalAmount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
          {selectedBill && (
            <>
              <div className="space-y-2">
                <Label>Project</Label>
                <Input value={selectedBill.project} disabled />
              </div>
              <div className="space-y-2">
                <Label>Contractor</Label>
                <Input value={selectedBill.contractor} disabled />
              </div>
              <div className="space-y-2">
                <Label>Bill Total</Label>
                <Input value={formatCurrency(selectedBill.finalAmount)} disabled />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              required
            />
          </div>
          {selectedBill && paidAmount && (
            <div className="space-y-2">
              <Label>Balance</Label>
              <Input value={formatCurrency(balance)} disabled />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Create Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

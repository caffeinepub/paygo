import { useMemo } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useListBills, useListPayments } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../../lib/formatters/currency';
import { FileText, CheckCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();

  // Check if user is authenticated (non-anonymous principal)
  const isAuthenticated = !!identity && identity.getPrincipal().toString() !== '2vxsx-fae';

  // Fetch data - queries will be disabled if actor is not ready
  const { data: bills = [], isLoading: billsLoading, isError: billsError, refetch: refetchBills } = useListBills();
  const { data: payments = [], isLoading: paymentsLoading, isError: paymentsError, refetch: refetchPayments } = useListPayments();

  const isLoading = billsLoading || paymentsLoading;
  const hasError = billsError || paymentsError;

  const stats = useMemo(() => {
    const totalBills = bills.length;
    const completedBills = bills.filter((b) => b.status === 'Completed').length;
    const completedPayments = payments.filter((p) => p.status === 'Completed').length;
    const pendingPayments = payments.filter((p) => p.status === 'Pending').length;
    const totalPaidAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0);

    return { totalBills, completedBills, completedPayments, pendingPayments, totalPaidAmount };
  }, [bills, payments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of your billing system</p>
      </div>

      {!isAuthenticated && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Sign in to view your dashboard statistics and manage billing data.</p>
        </div>
      )}

      {isAuthenticated && isLoading && (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      )}

      {isAuthenticated && hasError && !isLoading && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
          <p className="text-destructive font-medium">Failed to load dashboard data</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchBills();
              refetchPayments();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {isAuthenticated && !isLoading && !hasError && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBills}</div>
              <p className="text-xs text-muted-foreground">{stats.completedBills} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedPayments}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingPayments} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalPaidAmount)}</div>
              <p className="text-xs text-muted-foreground">All time payments</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

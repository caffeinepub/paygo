import { useState, useMemo } from 'react';
import { useListNMRs, useDeleteNMR, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import NMRFormDialog from './NMRFormDialog';
import NMRViewDialog from './NMRViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { canDelete, canRaiseBill } from '../../lib/roleAccess';
import { formatCurrency } from '../../lib/formatters/currency';
import { toast } from 'sonner';

export default function NMRPage() {
  const { data: nmrs = [], isLoading, isError, error, refetch } = useListNMRs();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteNMR();

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const canUserRaise = currentUser && canRaiseBill(currentUser.role);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedNMR, setSelectedNMR] = useState<any | null>(null);

  const sortedNMRs = useMemo(() => {
    return [...nmrs].sort((a, b) => b.id.localeCompare(a.id));
  }, [nmrs]);

  const handleView = (nmr: any) => {
    setSelectedNMR(nmr);
    setViewOpen(true);
  };

  const handleDelete = (nmr: any) => {
    setSelectedNMR(nmr);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedNMR) return;
    try {
      await deleteMutation.mutateAsync({ nmrId: selectedNMR.id, password });
      toast.success('NMR deleted successfully');
      setDeleteOpen(false);
      setSelectedNMR(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete NMR');
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
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading NMRs...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">NMR (Weekly Records)</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-destructive font-medium">Failed to load NMRs</p>
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
        <h1 className="text-3xl font-bold text-slate-900">NMR (Weekly Records)</h1>
        {canUserRaise && (
          <Button
            onClick={() => {
              setSelectedNMR(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create NMR
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All NMRs</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedNMRs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No NMRs found. {canUserRaise && 'Click "Create NMR" to create one.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Week Start</TableHead>
                  <TableHead>Week End</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNMRs.map((nmr, index) => (
                  <TableRow key={nmr.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-mono text-xs">{nmr.id}</TableCell>
                    <TableCell>{nmr.project}</TableCell>
                    <TableCell>{nmr.contractor}</TableCell>
                    <TableCell>{nmr.trade}</TableCell>
                    <TableCell>{nmr.weekStartDate}</TableCell>
                    <TableCell>{nmr.weekEndDate}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(nmr.finalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(nmr.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(nmr)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canUserDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(nmr)} title="Delete">
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

      <NMRFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <NMRViewDialog open={viewOpen} onOpenChange={setViewOpen} nmr={selectedNMR} />
      <DeleteWithPasswordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete NMR"
        description="Are you sure you want to delete this NMR? This action cannot be undone."
      />
    </div>
  );
}

import { useState } from 'react';
import { useListNMRs, useDeleteNMR, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Plus } from 'lucide-react';
import NMRFormDialog from './NMRFormDialog';
import NMRViewDialog from './NMRViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { formatCurrency } from '../../lib/formatters/currency';
import { canDelete, canRaiseBill } from '../../lib/roleAccess';
import { toast } from 'sonner';
import type { NMR } from '../../backend';

export default function NMRPage() {
  const { data: nmrs = [], isLoading } = useListNMRs();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteNMR();

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedNMR, setSelectedNMR] = useState<NMR | null>(null);

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const canUserRaise = currentUser && canRaiseBill(currentUser.role);

  const handleView = (nmr: NMR) => {
    setSelectedNMR(nmr);
    setViewOpen(true);
  };

  const handleDelete = (nmr: NMR) => {
    setSelectedNMR(nmr);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedNMR) return;

    try {
      await deleteMutation.mutateAsync({
        id: selectedNMR.id,
        password,
      });
      toast.success('NMR deleted successfully');
      setDeleteOpen(false);
      setSelectedNMR(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete NMR');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading NMR records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">NMR (Weekly)</h1>
        {canUserRaise && (
          <Button onClick={() => { setSelectedNMR(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Create NMR
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All NMR Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>Week Start</TableHead>
                <TableHead>Week End</TableHead>
                <TableHead>Final Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nmrs.map((nmr, index) => (
                <TableRow key={nmr.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <TableCell>{nmr.project}</TableCell>
                  <TableCell>{nmr.contractor}</TableCell>
                  <TableCell>{nmr.weekStartDate}</TableCell>
                  <TableCell>{nmr.weekEndDate}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(nmr.finalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={nmr.status === 'Completed' ? 'default' : 'secondary'}>
                      {nmr.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(nmr)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canUserDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(nmr)}
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

      <NMRFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <NMRViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        nmr={selectedNMR}
      />

      <DeleteWithPasswordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete NMR"
        description="Are you sure you want to delete this NMR record? This action cannot be undone."
      />
    </div>
  );
}

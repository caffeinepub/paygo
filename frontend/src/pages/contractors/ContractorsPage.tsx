import { useState, useMemo } from 'react';
import { useListContractors, useDeleteContractor, useListProjects, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Eye, Edit, Trash2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import ContractorFormDialog from './ContractorFormDialog';
import ContractorViewDialog from './ContractorViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { canDelete, isViewer } from '../../lib/roleAccess';
import { formatCurrency } from '../../lib/formatters/currency';
import { toast } from 'sonner';

export default function ContractorsPage() {
  const { data: contractors = [], isLoading, isError, error, refetch } = useListContractors();
  const { data: projects = [] } = useListProjects();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteContractor();

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const isViewerRole = currentUser && isViewer(currentUser.role);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<any | null>(null);

  const [projectFilter, setProjectFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  const filteredContractors = useMemo(() => {
    return contractors.filter((contractor) => {
      const matchesProject = !projectFilter || contractor.project.toLowerCase().includes(projectFilter.toLowerCase());
      const matchesTrade = !tradeFilter || contractor.trade.toLowerCase().includes(tradeFilter.toLowerCase());
      const matchesName = !nameFilter || contractor.contractorName.toLowerCase().includes(nameFilter.toLowerCase());
      return matchesProject && matchesTrade && matchesName;
    });
  }, [contractors, projectFilter, tradeFilter, nameFilter]);

  const handleView = (contractor: any) => {
    setSelectedContractor(contractor);
    setViewOpen(true);
  };

  const handleEdit = (contractor: any) => {
    setSelectedContractor(contractor);
    setFormOpen(true);
  };

  const handleDelete = (contractor: any) => {
    setSelectedContractor(contractor);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedContractor) return;
    try {
      await deleteMutation.mutateAsync({ contractorId: selectedContractor.id, password });
      toast.success('Contractor deleted successfully');
      setDeleteOpen(false);
      setSelectedContractor(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contractor');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading contractors...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Contractors</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-destructive font-medium">Failed to load contractors</p>
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
        <h1 className="text-3xl font-bold text-slate-900">Contractors</h1>
        {!isViewerRole && (
          <Button
            onClick={() => {
              setSelectedContractor(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contractor
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Filter by project..."
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            />
            <Input
              placeholder="Filter by trade..."
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
            />
            <Input
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Contractors ({filteredContractors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContractors.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No contractors found. {!isViewerRole && 'Click "Add Contractor" to create one.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Est. Qty</TableHead>
                  <TableHead>Est. Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContractors.map((contractor, index) => (
                  <TableRow key={contractor.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-mono text-xs">{contractor.id}</TableCell>
                    <TableCell className="font-medium">{contractor.contractorName}</TableCell>
                    <TableCell>{contractor.project}</TableCell>
                    <TableCell>{contractor.trade}</TableCell>
                    <TableCell>{contractor.unit}</TableCell>
                    <TableCell>{formatCurrency(contractor.unitPrice)}</TableCell>
                    <TableCell>{contractor.estimatedQty}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(contractor.estimatedAmount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(contractor)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!isViewerRole && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(contractor)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {canUserDelete && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(contractor)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
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

      <ContractorFormDialog open={formOpen} onOpenChange={setFormOpen} contractor={selectedContractor} />
      <ContractorViewDialog open={viewOpen} onOpenChange={setViewOpen} contractor={selectedContractor} />
      <DeleteWithPasswordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Contractor"
        description="Are you sure you want to delete this contractor? This action cannot be undone."
      />
    </div>
  );
}

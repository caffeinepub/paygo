import { useState, useMemo } from 'react';
import { useListContractors, useDeleteContractor, useGetCallerUserProfile, useListProjects } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import ContractorFormDialog from './ContractorFormDialog';
import ContractorViewDialog from './ContractorViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { formatCurrency } from '../../lib/formatters/currency';
import { canDelete, isViewer } from '../../lib/roleAccess';
import { toast } from 'sonner';
import type { Contractor } from '../../backend';

export default function ContractorsPage() {
  const { data: contractors = [], isLoading } = useListContractors();
  const { data: projects = [] } = useListProjects();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteContractor();

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  const [filterProject, setFilterProject] = useState('all');
  const [filterTrade, setFilterTrade] = useState('');
  const [filterName, setFilterName] = useState('');

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const isViewerRole = currentUser && isViewer(currentUser.role);

  const filteredContractors = useMemo(() => {
    return contractors.filter((contractor) => {
      if (filterProject !== 'all' && contractor.project !== filterProject) return false;
      if (filterTrade && !contractor.trade.toLowerCase().includes(filterTrade.toLowerCase())) return false;
      if (filterName && !contractor.contractorName.toLowerCase().includes(filterName.toLowerCase())) return false;
      return true;
    });
  }, [contractors, filterProject, filterTrade, filterName]);

  const handleView = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setViewOpen(true);
  };

  const handleEdit = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setFormOpen(true);
  };

  const handleDelete = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedContractor) return;

    try {
      await deleteMutation.mutateAsync({
        id: selectedContractor.id,
        password,
      });
      toast.success('Contractor deleted successfully');
      setDeleteOpen(false);
      setSelectedContractor(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contractor');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading contractors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Contractors</h1>
        {!isViewerRole && (
          <Button onClick={() => { setSelectedContractor(null); setFormOpen(true); }}>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trade</Label>
              <Input
                value={filterTrade}
                onChange={(e) => setFilterTrade(e.target.value)}
                placeholder="Filter by trade"
              />
            </div>
            <div className="space-y-2">
              <Label>Contractor Name</Label>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Contractors ({filteredContractors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contractor</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Est. Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContractors.map((contractor, index) => {
                const project = projects.find((p) => p.id === contractor.project);
                return (
                  <TableRow key={contractor.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-medium">{contractor.contractorName}</TableCell>
                    <TableCell>{project?.projectName || contractor.project}</TableCell>
                    <TableCell>{contractor.trade}</TableCell>
                    <TableCell>{contractor.unit}</TableCell>
                    <TableCell>{formatCurrency(contractor.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(contractor.estimatedAmount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(contractor)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!isViewerRole && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(contractor)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canUserDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(contractor)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ContractorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contractor={selectedContractor}
      />

      <ContractorViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        contractor={selectedContractor}
      />

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

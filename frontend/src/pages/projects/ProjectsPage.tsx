import { useState, useMemo } from 'react';
import { useListProjects, useDeleteProject, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Edit, Trash2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import ProjectFormDialog from './ProjectFormDialog';
import ProjectViewDialog from './ProjectViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { canDelete, isViewer } from '../../lib/roleAccess';
import { formatCurrency } from '../../lib/formatters/currency';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { data: projects = [], isLoading, isError, error, refetch } = useListProjects();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteProject();

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const isViewerRole = currentUser && isViewer(currentUser.role);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesSearch =
        !searchFilter ||
        project.projectName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, searchFilter]);

  const handleView = (project: any) => {
    setSelectedProject(project);
    setViewOpen(true);
  };

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  const handleDelete = (project: any) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedProject) return;
    try {
      await deleteMutation.mutateAsync({ projectId: selectedProject.id, password });
      toast.success('Project deleted successfully');
      setDeleteOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default">Active</Badge>;
      case 'Completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'On Hold':
        return <Badge variant="outline">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-destructive font-medium">Failed to load projects</p>
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
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        {!isViewerRole && (
          <Button
            onClick={() => {
              setSelectedProject(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by project or client name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No projects found. {!isViewerRole && 'Click "Add Project" to create one.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project, index) => (
                  <TableRow key={project.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-mono text-xs">{project.id}</TableCell>
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>{project.startDate}</TableCell>
                    <TableCell>{formatCurrency(project.estimatedBudget)}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(project)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!isViewerRole && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(project)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {canUserDelete && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(project)} title="Delete">
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

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} project={selectedProject} />
      <ProjectViewDialog open={viewOpen} onOpenChange={setViewOpen} project={selectedProject} />
      <DeleteWithPasswordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
      />
    </div>
  );
}

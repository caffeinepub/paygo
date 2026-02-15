import { useState } from 'react';
import { useListProjects, useDeleteProject, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import ProjectFormDialog from './ProjectFormDialog';
import ProjectViewDialog from './ProjectViewDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import { formatCurrency } from '../../lib/formatters/currency';
import { formatDate } from '../../lib/dates';
import { canDelete, isViewer } from '../../lib/roleAccess';
import { toast } from 'sonner';
import type { Project } from '../../backend';

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useListProjects();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteMutation = useDeleteProject();

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const isViewerRole = currentUser && isViewer(currentUser.role);

  const handleView = (project: Project) => {
    setSelectedProject(project);
    setViewOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedProject) return;

    try {
      await deleteMutation.mutateAsync({
        id: selectedProject.id,
        password,
      });
      toast.success('Project deleted successfully');
      setDeleteOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        {!isViewerRole && (
          <Button onClick={() => { setSelectedProject(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, index) => (
                <TableRow key={project.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <TableCell className="font-medium">{project.projectName}</TableCell>
                  <TableCell>{project.clientName}</TableCell>
                  <TableCell>{formatCurrency(project.estimatedBudget)}</TableCell>
                  <TableCell>{formatDate(project.startDate)}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(project)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!isViewerRole && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(project)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canUserDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project)}
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

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={selectedProject}
      />

      <ProjectViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        project={selectedProject}
      />

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

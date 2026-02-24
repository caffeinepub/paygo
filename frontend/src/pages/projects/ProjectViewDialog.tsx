import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../lib/formatters/currency';

interface ProjectViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any | null;
}

export default function ProjectViewDialog({ open, onOpenChange, project }: ProjectViewDialogProps) {
  if (!project) return null;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'on hold':
        return <Badge variant="outline">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
          <DialogDescription>View complete project information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project ID</Label>
              <p className="font-mono text-sm">{project.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(project.status)}</div>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Project Name</Label>
            <p className="font-semibold text-lg">{project.projectName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Client Name</Label>
              <p>{project.clientName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Start Date</Label>
              <p>{project.startDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Estimated Budget</Label>
              <p className="text-lg font-semibold">{formatCurrency(project.estimatedBudget)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contact Number</Label>
              <p>{project.contactNumber || 'N/A'}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Site Address</Label>
            <p className="text-sm">{project.siteAddress || 'N/A'}</p>
          </div>

          {project.locationLink1 && (
            <div>
              <Label className="text-muted-foreground">Site Location Link</Label>
              <a
                href={project.locationLink1}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline block"
              >
                {project.locationLink1}
              </a>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">Office Address</Label>
            <p className="text-sm">{project.officeAddress || 'N/A'}</p>
          </div>

          {project.locationLink2 && (
            <div>
              <Label className="text-muted-foreground">Office Location Link</Label>
              <a
                href={project.locationLink2}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline block"
              >
                {project.locationLink2}
              </a>
            </div>
          )}

          {project.note && (
            <div>
              <Label className="text-muted-foreground">Note</Label>
              <p className="text-sm whitespace-pre-wrap">{project.note}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../lib/formatters/currency';
import { formatDate } from '../../lib/dates';
import type { Project } from '../../backend';

interface ProjectViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export default function ProjectViewDialog({ open, onOpenChange, project }: ProjectViewDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project Name</Label>
              <p className="font-medium">{project.projectName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Client Name</Label>
              <p>{project.clientName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Start Date</Label>
              <p>{formatDate(project.startDate)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Estimated Budget</Label>
              <p className="font-semibold">{formatCurrency(project.estimatedBudget)}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Contact Number</Label>
            <p>{project.contactNumber}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Site Address</Label>
            <p className="whitespace-pre-wrap">{project.siteAddress}</p>
          </div>
          {project.locationLink1 && (
            <div>
              <Label className="text-muted-foreground">Location Link 1</Label>
              <a
                href={project.locationLink1}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {project.locationLink1}
              </a>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Office Address</Label>
            <p className="whitespace-pre-wrap">{project.officeAddress}</p>
          </div>
          {project.locationLink2 && (
            <div>
              <Label className="text-muted-foreground">Location Link 2</Label>
              <a
                href={project.locationLink2}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {project.locationLink2}
              </a>
            </div>
          )}
          {project.note && (
            <div>
              <Label className="text-muted-foreground">Note</Label>
              <p className="whitespace-pre-wrap">{project.note}</p>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

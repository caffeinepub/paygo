import { useEffect, useState } from 'react';
import { useCreateProject, useUpdateProject } from '../../hooks/useQueries';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Project } from '../../backend';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export default function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [locationLink1, setLocationLink1] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [locationLink2, setLocationLink2] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Active');

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const isEdit = !!project;

  useEffect(() => {
    if (project) {
      setProjectName(project.projectName);
      setClientName(project.clientName);
      setStartDate(project.startDate);
      setEstimatedBudget(project.estimatedBudget.toString());
      setContactNumber(project.contactNumber);
      setSiteAddress(project.siteAddress);
      setLocationLink1(project.locationLink1);
      setOfficeAddress(project.officeAddress);
      setLocationLink2(project.locationLink2);
      setNote(project.note);
      setStatus(project.status);
    } else {
      setProjectName('');
      setClientName('');
      setStartDate('');
      setEstimatedBudget('');
      setContactNumber('');
      setSiteAddress('');
      setLocationLink1('');
      setOfficeAddress('');
      setLocationLink2('');
      setNote('');
      setStatus('Active');
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const budget = parseFloat(estimatedBudget);
    if (isNaN(budget) || budget < 0) {
      toast.error('Please enter a valid budget');
      return;
    }

    try {
      if (isEdit && project) {
        await updateMutation.mutateAsync({
          id: project.id,
          projectName,
          clientName,
          startDate,
          estimatedBudget: budget,
          contactNumber,
          siteAddress,
          locationLink1,
          officeAddress,
          locationLink2,
          note,
          status,
        });
        toast.success('Project updated successfully');
      } else {
        await createMutation.mutateAsync({
          projectName,
          clientName,
          startDate,
          estimatedBudget: budget,
          contactNumber,
          siteAddress,
          locationLink1,
          officeAddress,
          locationLink2,
          note,
        });
        toast.success('Project created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} project`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Project' : 'Add Project'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update project information' : 'Create a new project'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedBudget">Estimated Budget (₹)</Label>
              <Input
                id="estimatedBudget"
                type="number"
                step="0.01"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteAddress">Site Address</Label>
            <Textarea
              id="siteAddress"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationLink1">Location Link 1</Label>
            <Input
              id="locationLink1"
              type="url"
              value={locationLink1}
              onChange={(e) => setLocationLink1(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="officeAddress">Office Address</Label>
            <Textarea
              id="officeAddress"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationLink2">Location Link 2</Label>
            <Input
              id="locationLink2"
              type="url"
              value={locationLink2}
              onChange={(e) => setLocationLink2(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

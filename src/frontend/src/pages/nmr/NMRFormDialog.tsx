import { useState } from 'react';
import { useCreateNMR, useListProjects, useListContractors, useGetCallerUserProfile } from '../../hooks/useQueries';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDays } from '../../lib/dates';
import { toast } from 'sonner';
import type { NMREntry } from '../../backend';

interface NMRFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NMRFormDialog({ open, onOpenChange }: NMRFormDialogProps) {
  const { data: projects = [] } = useListProjects();
  const { data: contractors = [] } = useListContractors();
  const { data: currentUser } = useGetCallerUserProfile();
  const createMutation = useCreateNMR();

  const [project, setProject] = useState('');
  const [contractor, setContractor] = useState('');
  const [weekStartDate, setWeekStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<NMREntry[]>([
    { date: '', labourType: '', noOfPersons: 0, rate: 0, hours: 0, duty: '', amount: 0 },
  ]);

  const weekEndDate = addDays(weekStartDate, 6);

  const handleAddEntry = () => {
    setEntries([...entries, { date: '', labourType: '', noOfPersons: 0, rate: 0, hours: 0, duty: '', amount: 0 }]);
  };

  const handleRemoveEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index: number, field: keyof NMREntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    // Auto-calculate amount
    if (field === 'noOfPersons' || field === 'rate' || field === 'hours') {
      const entry = newEntries[index];
      entry.amount = entry.noOfPersons * entry.rate * entry.hours;
    }
    
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (entries.length === 0) {
      toast.error('Please add at least one entry');
      return;
    }

    try {
      await createMutation.mutateAsync({
        project,
        contractor,
        weekStartDate,
        weekEndDate,
        entries,
      });
      toast.success('NMR created successfully');
      onOpenChange(false);
      // Reset form
      setProject('');
      setContractor('');
      setWeekStartDate(new Date().toISOString().split('T')[0]);
      setEntries([{ date: '', labourType: '', noOfPersons: 0, rate: 0, hours: 0, duty: '', amount: 0 }]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create NMR');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create NMR (Weekly)</DialogTitle>
          <DialogDescription>Create a new weekly NMR record</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject} required>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractor">Contractor</Label>
              <Select value={contractor} onValueChange={setContractor} required>
                <SelectTrigger id="contractor">
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.contractorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekStartDate">Week Start Date</Label>
              <Input
                id="weekStartDate"
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Week End Date</Label>
              <Input value={weekEndDate} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Engineer Name</Label>
            <Input value={currentUser?.name || ''} disabled />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Entries</Label>
              <Button type="button" size="sm" onClick={handleAddEntry}>
                Add Entry
              </Button>
            </div>
            {entries.map((entry, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={entry.date}
                      onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Labour Type</Label>
                    <Input
                      value={entry.labourType}
                      onChange={(e) => handleEntryChange(index, 'labourType', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">No. of Persons</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.noOfPersons}
                      onChange={(e) => handleEntryChange(index, 'noOfPersons', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.rate}
                      onChange={(e) => handleEntryChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Hours</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.hours}
                      onChange={(e) => handleEntryChange(index, 'hours', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duty</Label>
                    <Input
                      value={entry.duty}
                      onChange={(e) => handleEntryChange(index, 'duty', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount</Label>
                    <Input value={entry.amount.toFixed(2)} disabled />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveEntry(index)}
                      disabled={entries.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Save Week
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

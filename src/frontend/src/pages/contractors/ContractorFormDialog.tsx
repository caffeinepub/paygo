import { useEffect, useState } from 'react';
import { useCreateContractor, useUpdateContractor, useListProjects } from '../../hooks/useQueries';
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
import { UNITS } from '../../lib/units';
import { toast } from 'sonner';
import type { Contractor } from '../../backend';

interface ContractorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: Contractor | null;
}

export default function ContractorFormDialog({ open, onOpenChange, contractor }: ContractorFormDialogProps) {
  const { data: projects = [] } = useListProjects();
  const [date, setDate] = useState('');
  const [project, setProject] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [trade, setTrade] = useState('');
  const [unit, setUnit] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [estimatedQty, setEstimatedQty] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [attachments, setAttachments] = useState('');

  const createMutation = useCreateContractor();
  const updateMutation = useUpdateContractor();

  const isEdit = !!contractor;

  useEffect(() => {
    if (contractor) {
      setDate(contractor.date);
      setProject(contractor.project);
      setContractorName(contractor.contractorName);
      setTrade(contractor.trade);
      setUnit(contractor.unit);
      setUnitPrice(contractor.unitPrice.toString());
      setEstimatedQty(contractor.estimatedQty.toString());
      setMobile(contractor.mobile);
      setEmail(contractor.email);
      setAddress(contractor.address);
      setAttachments(contractor.attachments.join(', '));
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setProject('');
      setContractorName('');
      setTrade('');
      setUnit('');
      setUnitPrice('');
      setEstimatedQty('');
      setMobile('');
      setEmail('');
      setAddress('');
      setAttachments('');
    }
  }, [contractor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(unitPrice);
    const qty = parseFloat(estimatedQty);

    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid unit price');
      return;
    }

    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid estimated quantity');
      return;
    }

    const estimatedAmount = price * qty;
    const attachmentList = attachments
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    try {
      if (isEdit && contractor) {
        await updateMutation.mutateAsync({
          id: contractor.id,
          date,
          project,
          contractorName,
          trade,
          unit,
          unitPrice: price,
          estimatedQty: qty,
          estimatedAmount,
          mobile,
          email,
          address,
          attachments: attachmentList,
        });
        toast.success('Contractor updated successfully');
      } else {
        await createMutation.mutateAsync({
          date,
          project,
          contractorName,
          trade,
          unit,
          unitPrice: price,
          estimatedQty: qty,
          estimatedAmount,
          mobile,
          email,
          address,
          attachments: attachmentList,
        });
        toast.success('Contractor created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} contractor`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Contractor' : 'Add Contractor'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update contractor information' : 'Create a new contractor'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractorName">Contractor Name</Label>
            <Input
              id="contractorName"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trade">Trade</Label>
              <Input
                id="trade"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit} required>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (₹)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedQty">Estimated Qty</Label>
              <Input
                id="estimatedQty"
                type="number"
                step="0.01"
                value={estimatedQty}
                onChange={(e) => setEstimatedQty(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (comma-separated URLs)</Label>
            <Textarea
              id="attachments"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              rows={2}
              placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf"
            />
          </div>
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

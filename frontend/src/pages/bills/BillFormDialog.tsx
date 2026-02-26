import { useState } from 'react';
import { useCreateBill, useListProjects, useListContractors, useGetCallerUserProfile } from '../../hooks/useQueries';
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
import type { Principal } from '@dfinity/principal';

interface BillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BillFormDialog({ open, onOpenChange }: BillFormDialogProps) {
  const { data: projects = [] } = useListProjects();
  const { data: contractors = [] } = useListContractors();
  const { data: currentUser } = useGetCallerUserProfile();
  const createMutation = useCreateBill();

  const [project, setProject] = useState('');
  const [contractor, setContractor] = useState('');
  const [projectDate, setProjectDate] = useState(new Date().toISOString().split('T')[0]);
  const [trade, setTrade] = useState('');
  const [unit, setUnit] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(unitPrice);
    const qty = parseFloat(quantity);

    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid unit price');
      return;
    }

    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const total = price * qty;
    const billId = `BILL-${Date.now()}`;

    try {
      await createMutation.mutateAsync({
        id: billId,
        billNumber: billId,
        contractor,
        project,
        projectDate,
        trade,
        unit,
        unitPrice: price,
        quantity: qty,
        total,
        description,
        location,
        authorizedEngineer: currentUser?.name || '',
        pmApproved: false,
        pmDebit: 0,
        pmNote: '',
        qcApproved: false,
        qcDebit: 0,
        qcNote: '',
        billingApproved: false,
        finalAmount: total,
        status: 'Pending PM',
        createdBy: currentUser?.principal as Principal,
      });
      toast.success('Bill created successfully');
      onOpenChange(false);
      // Reset form
      setProject('');
      setContractor('');
      setProjectDate(new Date().toISOString().split('T')[0]);
      setTrade('');
      setUnit('');
      setUnitPrice('');
      setQuantity('');
      setDescription('');
      setLocation('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create bill');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Raise Bill</DialogTitle>
          <DialogDescription>Create a new bill for a project</DialogDescription>
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
              <Select
                value={contractor}
                onValueChange={(val) => {
                  setContractor(val);
                  const c = contractors.find((ct) => ct.id === val);
                  if (c) {
                    setTrade(c.trade);
                    setUnit(c.unit);
                    setUnitPrice(c.unitPrice.toString());
                  }
                }}
                required
              >
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
          <div className="space-y-2">
            <Label htmlFor="projectDate">Project Date</Label>
            <Input
              id="projectDate"
              type="date"
              value={projectDate}
              onChange={(e) => setProjectDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trade">Trade</Label>
              <Input id="trade" value={trade} onChange={(e) => setTrade(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} required />
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>
          {unitPrice && quantity && (
            <div className="rounded bg-blue-50 p-3">
              <Label className="text-muted-foreground">Total Amount</Label>
              <p className="text-lg font-semibold">
                ₹
                {(parseFloat(unitPrice) * parseFloat(quantity)).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Authorized Engineer</Label>
            <Input value={currentUser?.name || ''} disabled />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

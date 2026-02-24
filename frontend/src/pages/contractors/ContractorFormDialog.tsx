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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UNITS } from '../../lib/units';

interface ContractorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: any | null;
}

export default function ContractorFormDialog({ open, onOpenChange, contractor }: ContractorFormDialogProps) {
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

  const { data: projects = [] } = useListProjects();
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
    }
  }, [contractor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !project || !contractorName.trim() || !trade.trim() || !unit || !unitPrice || !estimatedQty) {
      toast.error('Please fill in all required fields');
      return;
    }

    const unitPriceNum = parseFloat(unitPrice);
    const estimatedQtyNum = parseFloat(estimatedQty);

    if (isNaN(unitPriceNum) || isNaN(estimatedQtyNum)) {
      toast.error('Please enter valid numbers for unit price and quantity');
      return;
    }

    const estimatedAmount = unitPriceNum * estimatedQtyNum;

    try {
      if (isEdit && contractor) {
        await updateMutation.mutateAsync({
          id: contractor.id,
          date,
          project,
          contractorName: contractorName.trim(),
          trade: trade.trim(),
          unit,
          unitPrice: unitPriceNum,
          estimatedQty: estimatedQtyNum,
          estimatedAmount,
          mobile: mobile.trim(),
          email: email.trim(),
          address: address.trim(),
          attachments: contractor.attachments || [],
        });
        toast.success('Contractor updated successfully');
      } else {
        await createMutation.mutateAsync({
          date,
          project,
          contractorName: contractorName.trim(),
          trade: trade.trim(),
          unit,
          unitPrice: unitPriceNum,
          estimatedQty: estimatedQtyNum,
          estimatedAmount,
          mobile: mobile.trim(),
          email: email.trim(),
          address: address.trim(),
          attachments: [],
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Contractor' : 'Add Contractor'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update contractor information' : 'Create a new contractor entry'}
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
                  {projects.map((proj: any) => (
                    <SelectItem key={proj.id} value={proj.projectName}>
                      {proj.projectName}
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
              placeholder="Enter contractor name"
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
                placeholder="e.g., Plumbing, Electrical"
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
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedQty">Estimated Quantity</Label>
              <Input
                id="estimatedQty"
                type="number"
                step="0.01"
                value={estimatedQty}
                onChange={(e) => setEstimatedQty(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {unitPrice && estimatedQty && (
            <div className="bg-blue-50 p-3 rounded">
              <Label className="text-muted-foreground">Estimated Amount</Label>
              <p className="text-lg font-semibold">
                ₹{(parseFloat(unitPrice) * parseFloat(estimatedQty)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
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

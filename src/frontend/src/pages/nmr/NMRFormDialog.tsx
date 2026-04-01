import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@dfinity/principal";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreateNMR,
  useGetCallerUserProfile,
  useListContractors,
  useListProjects,
} from "../../hooks/useQueries";

interface NMRFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NMREntryRow {
  rowKey: string;
  date: string;
  labourType: string;
  noOfPersons: string;
  rate: string;
  hours: string;
  duty: string;
  amount: number;
}

let entryCounter = 0;

export default function NMRFormDialog({
  open,
  onOpenChange,
}: NMRFormDialogProps) {
  const [project, setProject] = useState("");
  const [contractor, setContractor] = useState("");
  const [weekStartDate, setWeekStartDate] = useState("");
  const [weekEndDate, setWeekEndDate] = useState("");
  const [entries, setEntries] = useState<NMREntryRow[]>([]);

  const { data: projects = [] } = useListProjects();
  const { data: contractors = [] } = useListContractors();
  const { data: currentUser } = useGetCallerUserProfile();
  const createMutation = useCreateNMR();

  useEffect(() => {
    if (!open) {
      setProject("");
      setContractor("");
      setWeekStartDate("");
      setWeekEndDate("");
      setEntries([]);
    }
  }, [open]);

  const addEntry = () => {
    entryCounter += 1;
    setEntries([
      ...entries,
      {
        rowKey: `nmr-row-${entryCounter}`,
        date: "",
        labourType: "",
        noOfPersons: "",
        rate: "",
        hours: "",
        duty: "",
        amount: 0,
      },
    ]);
  };

  const removeEntry = (rowKey: string) => {
    setEntries(entries.filter((e) => e.rowKey !== rowKey));
  };

  const updateEntry = (
    rowKey: string,
    field: keyof NMREntryRow,
    value: string,
  ) => {
    const newEntries = entries.map((e) => {
      if (e.rowKey !== rowKey) return e;
      const updated = { ...e, [field]: value };
      const persons = Number.parseFloat(updated.noOfPersons) || 0;
      const rate = Number.parseFloat(updated.rate) || 0;
      const hours = Number.parseFloat(updated.hours) || 0;
      updated.amount = persons * rate * hours;
      return updated;
    });
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project || !contractor || !weekStartDate || !weekEndDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (entries.length === 0) {
      toast.error("Please add at least one entry");
      return;
    }

    const formattedEntries = entries.map((entry) => ({
      date: entry.date,
      labourType: entry.labourType,
      noOfPersons: Number.parseFloat(entry.noOfPersons) || 0,
      rate: Number.parseFloat(entry.rate) || 0,
      hours: Number.parseFloat(entry.hours) || 0,
      duty: entry.duty,
      amount: entry.amount,
    }));

    const totalAmount = formattedEntries.reduce((sum, e) => sum + e.amount, 0);
    const selectedContractor = contractors.find(
      (c) => c.contractorName === contractor,
    );
    const nmrId = `NMR-${Date.now()}`;

    try {
      await createMutation.mutateAsync({
        id: nmrId,
        project,
        contractor,
        trade: selectedContractor?.trade || "",
        weekStartDate,
        weekEndDate,
        engineerName: currentUser?.name || "",
        entries: formattedEntries,
        pmApproved: false,
        pmDebit: 0,
        pmNote: "",
        qcApproved: false,
        qcDebit: 0,
        qcNote: "",
        billingApproved: false,
        finalAmount: totalAmount,
        status: "Pending PM",
        createdBy: currentUser?.principal as Principal,
      });
      toast.success("NMR created successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create NMR");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create NMR</DialogTitle>
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
                  {projects.map((proj: any) => (
                    <SelectItem key={proj.id} value={proj.projectName}>
                      {proj.projectName}
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
                  {contractors.map((cont: any) => (
                    <SelectItem key={cont.id} value={cont.contractorName}>
                      {cont.contractorName}
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
              <Label htmlFor="weekEndDate">Week End Date</Label>
              <Input
                id="weekEndDate"
                type="date"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Entries</Label>
              <Button type="button" size="sm" onClick={addEntry}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
            {entries.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Labour Type</TableHead>
                      <TableHead>No. of Persons</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Duty</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.rowKey}>
                        <TableCell>
                          <Input
                            type="date"
                            value={entry.date}
                            onChange={(e) =>
                              updateEntry(entry.rowKey, "date", e.target.value)
                            }
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={entry.labourType}
                            onChange={(e) =>
                              updateEntry(
                                entry.rowKey,
                                "labourType",
                                e.target.value,
                              )
                            }
                            placeholder="Type"
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.noOfPersons}
                            onChange={(e) =>
                              updateEntry(
                                entry.rowKey,
                                "noOfPersons",
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.rate}
                            onChange={(e) =>
                              updateEntry(entry.rowKey, "rate", e.target.value)
                            }
                            placeholder="0"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.hours}
                            onChange={(e) =>
                              updateEntry(entry.rowKey, "hours", e.target.value)
                            }
                            placeholder="0"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={entry.duty}
                            onChange={(e) =>
                              updateEntry(entry.rowKey, "duty", e.target.value)
                            }
                            placeholder="Duty"
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          ₹{entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEntry(entry.rowKey)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {entries.length > 0 && (
            <div className="rounded bg-blue-50 p-3">
              <Label className="text-muted-foreground">Total Amount</Label>
              <p className="text-lg font-semibold">
                ₹
                {entries
                  .reduce((sum, entry) => sum + entry.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create NMR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

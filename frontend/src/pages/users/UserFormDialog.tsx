import { useState, useEffect } from 'react';
import { useUpdateUser } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { UserRole, type UserProfile } from '../../backend';
import { getRoleForSelect, roleFromString } from '../../lib/roleAccess';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserProfile | null;
}

export default function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const updateMutation = useUpdateUser();

  const [role, setRole] = useState<string>('viewer');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user) {
      setRole(getRoleForSelect(user.role));
      setIsActive(user.isActive);
    } else {
      setRole('viewer');
      setIsActive(true);
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await updateMutation.mutateAsync({
        userPrincipal: user.principal,
        role: roleFromString(role),
        isActive,
      });
      toast.success('User updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {user && (
              <div className="space-y-1 rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-medium">{user.name || <span className="italic text-muted-foreground">No name set</span>}</p>
                <p className="text-muted-foreground">{user.email || 'No email set'}</p>
                <p className="font-mono text-xs text-muted-foreground">{user.payGoId}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="siteEngineer">Site Engineer</SelectItem>
                  <SelectItem value="projectManager">Project Manager</SelectItem>
                  <SelectItem value="qc">QC</SelectItem>
                  <SelectItem value="billingEngineer">Billing Engineer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

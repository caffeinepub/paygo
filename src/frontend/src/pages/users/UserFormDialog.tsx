import { useEffect, useState } from 'react';
import { useCreateUser, useUpdateUser } from '../../hooks/useQueries';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { isMainAdmin, getRoleForSelect, roleFromString } from '../../lib/roleAccess';
import type { UserProfile } from '../../backend';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}

export default function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('viewer');
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isEdit = !!user;
  const isMainAdminUser = email ? isMainAdmin(email) : false;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setMobile(user.mobile);
      setRole(getRoleForSelect(user.role));
      setIsActive(user.isActive);
    } else {
      setName('');
      setEmail('');
      setMobile('');
      setRole('viewer');
      setIsActive(true);
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !mobile.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (isEdit && user) {
        await updateMutation.mutateAsync({
          userPrincipal: user.principal,
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          role: roleFromString(role),
          isActive,
        });
        toast.success('User updated successfully');
      } else {
        // Create a pending user - backend will assign principal when they log in
        // Do NOT pass the current admin's principal
        await createMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
        });
        toast.success('User created successfully. They can now log in with Internet Identity.');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user information' : 'Create a new user account. The user will be able to log in with Internet Identity.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
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
              placeholder="Enter email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              required
            />
          </div>
          {isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole} disabled={isMainAdminUser}>
                  <SelectTrigger id="role">
                    <SelectValue />
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
                {isMainAdminUser && (
                  <p className="text-xs text-muted-foreground">
                    Main admin role cannot be changed
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active Status</Label>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isMainAdminUser}
                />
              </div>
            </>
          )}
          {!isEdit && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              <strong>Note:</strong> The user will be created with Viewer role by default. You can change their role after they log in for the first time.
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

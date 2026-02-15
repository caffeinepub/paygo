import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import RoleBadge from '../../components/AppShell/RoleBadge';
import type { User } from '../../backend';

interface UserViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function UserViewDialog({ open, onOpenChange, user }: UserViewDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">PayGo ID</Label>
            <p className="font-mono text-sm">{user.payGoId}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p>{user.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Mobile</Label>
            <p>{user.mobile}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Role</Label>
            <div className="mt-1">
              <RoleBadge role={user.role} />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Principal</Label>
            <p className="break-all font-mono text-xs">{user.principal.toString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

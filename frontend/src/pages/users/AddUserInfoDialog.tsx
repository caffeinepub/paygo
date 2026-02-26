import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn, UserCheck, Info } from 'lucide-react';

interface AddUserInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserInfoDialog({ open, onOpenChange }: AddUserInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            How to Add a New User
          </DialogTitle>
          <DialogDescription>
            Users are automatically created when they log in for the first time. Follow the steps below to onboard a new team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-sm">
                <LogIn className="h-4 w-4 text-primary" />
                Share the App Link
              </div>
              <p className="text-sm text-muted-foreground">
                Share the PayGo application link with the new user and ask them to log in using their Internet Identity.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-sm">
                <UserCheck className="h-4 w-4 text-primary" />
                User Logs In
              </div>
              <p className="text-sm text-muted-foreground">
                When the user logs in for the first time, their account is automatically created with a <strong>Viewer</strong> role by default.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              3
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-sm">
                <UserPlus className="h-4 w-4 text-primary" />
                Assign a Role
              </div>
              <p className="text-sm text-muted-foreground">
                Once the user appears in this list, click the <strong>Edit</strong> (pencil) icon next to their name to assign the appropriate role and activate their account.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              After the user logs in, click <strong>Refresh</strong> on this page to see their account appear in the list.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

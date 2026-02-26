import { useState } from 'react';
import { useListUsers, useDeleteUser, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, RefreshCw, AlertCircle, UserPlus } from 'lucide-react';
import UserViewDialog from './UserViewDialog';
import UserFormDialog from './UserFormDialog';
import AddUserInfoDialog from './AddUserInfoDialog';
import DeleteWithPasswordDialog from '../../components/dialogs/DeleteWithPasswordDialog';
import RoleBadge from '../../components/AppShell/RoleBadge';
import { canDelete, isAdmin } from '../../lib/roleAccess';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function UsersPage() {
  const { data: users = [], isLoading, isError, error, refetch } = useListUsers();
  const { data: currentUser } = useGetCallerUserProfile();
  const deleteUserMutation = useDeleteUser();

  const canUserDelete = currentUser && canDelete(currentUser.role);
  const canUserEdit = currentUser && isAdmin(currentUser.role);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleView = (user: any) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedUser) return;
    try {
      await deleteUserMutation.mutateAsync({
        userPrincipal: selectedUser.principal as Principal,
        password,
      });
      toast.success('User deleted successfully');
      setDeleteOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-destructive font-medium">Failed to load users</p>
            <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500">
            {users.length} user{users.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canUserEdit && (
            <Button size="sm" onClick={() => setAddUserOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PayGo ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.payGoId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-mono text-xs">{user.payGoId}</TableCell>
                    <TableCell className="font-medium">
                      {user.name || <span className="italic text-muted-foreground">Not set</span>}
                    </TableCell>
                    <TableCell>
                      {user.email || <span className="italic text-muted-foreground">Not set</span>}
                    </TableCell>
                    <TableCell>
                      {user.mobile || <span className="italic text-muted-foreground">Not set</span>}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(user)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canUserEdit && (
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canUserDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddUserInfoDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
      <UserViewDialog open={viewOpen} onOpenChange={setViewOpen} user={selectedUser} />
      <UserFormDialog open={editOpen} onOpenChange={setEditOpen} user={selectedUser} />
      <DeleteWithPasswordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}

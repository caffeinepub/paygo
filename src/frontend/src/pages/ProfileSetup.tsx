import { useState } from 'react';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CurrentInternetIdentityPanel from '../components/CurrentInternetIdentityPanel';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { UserRole } from '../backend';
import type { UserProfile } from '../backend';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const { identity } = useInternetIdentity();
  const { refetch } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !mobile.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!identity) {
      toast.error('Identity not available');
      return;
    }

    const profile: UserProfile = {
      payGoId: '',
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      role: UserRole.viewer,
      isActive: true,
      principal: identity.getPrincipal(),
    };

    try {
      await saveMutation.mutateAsync(profile);
      toast.success('Profile created successfully');
      refetch();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create profile';
      if (errorMessage.includes('User not found')) {
        toast.error('Your account must be created by an administrator. Please contact support.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to PayGo</CardTitle>
            <CardDescription>Please complete your profile to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> User accounts must be created by an administrator. 
                First-time self-registration is restricted to the main admin email: <strong>jogaraoseri.er@mktconstructions.com</strong>
              </AlertDescription>
            </Alert>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
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
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Creating Profile...' : 'Create Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <CurrentInternetIdentityPanel />
    </>
  );
}

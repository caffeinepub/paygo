import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import RoleBadge from './RoleBadge';
import { isAdmin } from '../../lib/roleAccess';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  HardHat,
  FileText,
  Calendar,
  CreditCard,
  BarChart3,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();

  // Check if user is authenticated (non-anonymous principal)
  const isAuthenticated = !!identity && identity.getPrincipal().toString() !== '2vxsx-fae';

  // Fetch profile when authenticated — renders immediately from cache if available
  const { data: userProfile } = useGetCallerUserProfile(isAuthenticated);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { path: '/users', label: 'Users', icon: Users, show: userProfile && isAdmin(userProfile.role) },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { path: '/projects', label: 'Projects', icon: FolderKanban, show: true },
    { path: '/contractors', label: 'Contractors', icon: HardHat, show: true },
    { path: '/bills', label: 'Bills', icon: FileText, show: true },
    { path: '/nmr', label: 'NMR', icon: Calendar, show: true },
    { path: '/payments', label: 'Payments', icon: CreditCard, show: true },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, show: true },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 p-6">
        <img
          src="/assets/generated/paygo-logo.dim_512x512.png"
          alt="PayGo"
          className="h-10 w-10"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">PayGo</h1>
          <p className="text-xs text-slate-500">Billing System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map(
            (item) =>
              item.show && (
                <li key={item.path}>
                  <button
                    onClick={() => navigate({ to: item.path })}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      currentPath === item.path
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              )
          )}
        </ul>
      </nav>

      {/* Footer - only show when authenticated and profile exists */}
      {isAuthenticated && userProfile && (
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-medium text-slate-900">{userProfile.name || 'User'}</p>
            <p className="text-xs text-slate-500">{userProfile.email}</p>
            <div className="pt-1">
              <RoleBadge role={userProfile.role} />
            </div>
          </div>
          <Separator className="my-3" />
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}

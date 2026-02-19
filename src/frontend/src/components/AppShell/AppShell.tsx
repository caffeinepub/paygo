import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  banner?: ReactNode;
}

export default function AppShell({ children, banner }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {banner}
        {children}
      </main>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { UserRole__1 } from '../../backend';

interface RoleBadgeProps {
  role: UserRole__1;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleDisplay = (role: UserRole__1): string => {
    switch (role) {
      case UserRole__1.admin:
        return 'Admin';
      case UserRole__1.siteEngineer:
        return 'Site Engineer';
      case UserRole__1.projectManager:
        return 'Project Manager';
      case UserRole__1.qc:
        return 'QC';
      case UserRole__1.billingEngineer:
        return 'Billing Engineer';
      case UserRole__1.viewer:
        return 'Viewer';
      default:
        return 'Unknown';
    }
  };

  const getRoleVariant = (role: UserRole__1): 'default' | 'secondary' | 'outline' => {
    if (role === UserRole__1.admin) return 'default';
    if (
      role === UserRole__1.siteEngineer ||
      role === UserRole__1.projectManager ||
      role === UserRole__1.qc ||
      role === UserRole__1.billingEngineer
    )
      return 'secondary';
    return 'outline';
  };

  return (
    <Badge variant={getRoleVariant(role)} className="text-xs">
      {getRoleDisplay(role)}
    </Badge>
  );
}

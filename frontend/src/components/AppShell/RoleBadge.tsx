import { Badge } from '@/components/ui/badge';
import { UserRole } from '../../backend';

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleDisplay = (role: UserRole): string => {
    switch (role) {
      case UserRole.admin:
        return 'Admin';
      case UserRole.siteEngineer:
        return 'Site Engineer';
      case UserRole.projectManager:
        return 'Project Manager';
      case UserRole.qc:
        return 'QC';
      case UserRole.billingEngineer:
        return 'Billing Engineer';
      case UserRole.viewer:
        return 'Viewer';
      default:
        return 'Unknown';
    }
  };

  const getRoleVariant = (role: UserRole): 'default' | 'secondary' | 'outline' => {
    if (role === UserRole.admin) return 'default';
    if (
      role === UserRole.siteEngineer ||
      role === UserRole.projectManager ||
      role === UserRole.qc ||
      role === UserRole.billingEngineer
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

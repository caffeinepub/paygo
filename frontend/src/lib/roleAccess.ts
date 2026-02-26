import { UserRole } from '../backend';

export const MAIN_ADMIN_EMAIL = 'jogaraoseri.er@mktconstructions.com';

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.admin;
}

export function canRaiseBill(role: UserRole): boolean {
  return role === UserRole.admin || role === UserRole.siteEngineer;
}

export function canApprovePM(role: UserRole): boolean {
  return role === UserRole.admin || role === UserRole.projectManager;
}

export function canApproveQC(role: UserRole): boolean {
  return role === UserRole.admin || role === UserRole.qc;
}

export function canApproveBilling(role: UserRole): boolean {
  return role === UserRole.admin || role === UserRole.billingEngineer;
}

export function canDelete(role: UserRole): boolean {
  return role === UserRole.admin;
}

export function isViewer(role: UserRole): boolean {
  return role === UserRole.viewer;
}

export function isMainAdmin(email: string): boolean {
  return email === MAIN_ADMIN_EMAIL;
}

export function getRoleForSelect(role: UserRole): string {
  switch (role) {
    case UserRole.admin:
      return 'admin';
    case UserRole.siteEngineer:
      return 'siteEngineer';
    case UserRole.projectManager:
      return 'projectManager';
    case UserRole.qc:
      return 'qc';
    case UserRole.billingEngineer:
      return 'billingEngineer';
    case UserRole.viewer:
      return 'viewer';
    default:
      return 'viewer';
  }
}

export function roleFromString(roleStr: string): UserRole {
  switch (roleStr) {
    case 'admin':
      return UserRole.admin;
    case 'siteEngineer':
      return UserRole.siteEngineer;
    case 'projectManager':
      return UserRole.projectManager;
    case 'qc':
      return UserRole.qc;
    case 'billingEngineer':
      return UserRole.billingEngineer;
    case 'viewer':
    default:
      return UserRole.viewer;
  }
}

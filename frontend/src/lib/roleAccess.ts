import { UserRole__1 } from '../backend';

export const MAIN_ADMIN_EMAIL = 'jogaraoseri.er@mktconstructions.com';

export function isAdmin(role: UserRole__1): boolean {
  return role === UserRole__1.admin;
}

export function canRaiseBill(role: UserRole__1): boolean {
  return role === UserRole__1.admin || role === UserRole__1.siteEngineer;
}

export function canApprovePM(role: UserRole__1): boolean {
  return role === UserRole__1.admin || role === UserRole__1.projectManager;
}

export function canApproveQC(role: UserRole__1): boolean {
  return role === UserRole__1.admin || role === UserRole__1.qc;
}

export function canApproveBilling(role: UserRole__1): boolean {
  return role === UserRole__1.admin || role === UserRole__1.billingEngineer;
}

export function canDelete(role: UserRole__1): boolean {
  return role === UserRole__1.admin;
}

export function isViewer(role: UserRole__1): boolean {
  return role === UserRole__1.viewer;
}

export function isMainAdmin(email: string): boolean {
  return email === MAIN_ADMIN_EMAIL;
}

export function getRoleForSelect(role: UserRole__1): string {
  switch (role) {
    case UserRole__1.admin:
      return 'admin';
    case UserRole__1.siteEngineer:
      return 'siteEngineer';
    case UserRole__1.projectManager:
      return 'projectManager';
    case UserRole__1.qc:
      return 'qc';
    case UserRole__1.billingEngineer:
      return 'billingEngineer';
    case UserRole__1.viewer:
      return 'viewer';
    default:
      return 'viewer';
  }
}

export function roleFromString(roleStr: string): UserRole__1 {
  switch (roleStr) {
    case 'admin':
      return UserRole__1.admin;
    case 'siteEngineer':
      return UserRole__1.siteEngineer;
    case 'projectManager':
      return UserRole__1.projectManager;
    case 'qc':
      return UserRole__1.qc;
    case 'billingEngineer':
      return UserRole__1.billingEngineer;
    case 'viewer':
    default:
      return UserRole__1.viewer;
  }
}

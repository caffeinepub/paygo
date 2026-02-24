import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserRole__1 } from '../backend';
import { Principal } from '@dfinity/principal';

// Type aliases for missing backend types - these should be regenerated from backend
type Project = any;
type Contractor = any;
type Bill = any;
type NMR = any;
type Payment = any;
type NMREntry = any;

// Query Keys
export const queryKeys = {
  currentUserProfile: ['currentUserProfile'],
  users: ['users'],
  projects: ['projects'],
  contractors: ['contractors'],
  bills: ['bills'],
  nmrs: ['nmrs'],
  payments: ['payments'],
};

// Current User Profile
export function useGetCallerUserProfile(authRequired: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: queryKeys.currentUserProfile,
    queryFn: async () => {
      console.log('[useGetCallerUserProfile] Query function called', {
        timestamp: new Date().toISOString(),
        hasActor: !!actor,
        actorFetching,
      });

      if (!actor) {
        console.log('[useGetCallerUserProfile] Actor not available, throwing error');
        throw new Error('Actor not available');
      }

      console.log('[useGetCallerUserProfile] Calling actor.getCallerUserProfile()');
      const startTime = Date.now();
      
      try {
        const result = await (actor as any).getCallerUserProfile();
        const duration = Date.now() - startTime;
        console.log('[useGetCallerUserProfile] Profile fetch completed', {
          duration: `${duration}ms`,
          result: result ? 'profile exists' : result === null ? 'null' : 'undefined',
        });
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error('[useGetCallerUserProfile] Profile fetch failed', {
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    enabled: authRequired && !!actor && !actorFetching,
    retry: 2,
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 3000);
      console.log('[useGetCallerUserProfile] Retry attempt', { attemptIndex, delay });
      return delay;
    },
  });

  // Log query state changes
  const isLoading = authRequired ? (actorFetching || query.isLoading) : false;
  const isFetched = authRequired ? (!!actor && query.isFetched) : true;

  console.log('[useGetCallerUserProfile] Hook state', {
    authRequired,
    actorFetching,
    queryIsLoading: query.isLoading,
    queryIsFetching: query.isFetching,
    queryIsFetched: query.isFetched,
    queryEnabled: authRequired && !!actor && !actorFetching,
    computedIsLoading: isLoading,
    computedIsFetched: isFetched,
    hasData: !!query.data,
    hasError: !!query.error,
  });

  return {
    ...query,
    isLoading,
    isFetched,
  };
}

export function useBootstrapMainAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('[useBootstrapMainAdmin] Mutation called');
      if (!actor) throw new Error('Actor not available');
      const result = await (actor as any).getOrCreateMainAdminUser();
      console.log('[useBootstrapMainAdmin] Admin user created/retrieved');
      return result;
    },
    onSuccess: (profile) => {
      console.log('[useBootstrapMainAdmin] Success, updating cache');
      // Immediately set the cached profile to avoid intermediate states
      queryClient.setQueryData(queryKeys.currentUserProfile, profile);
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUserProfile });
    },
    onError: (error) => {
      console.error('[useBootstrapMainAdmin] Error:', error);
    },
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUserProfile });
    },
  });
}

export function useCompletePendingUserSetup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('[useCompletePendingUserSetup] Mutation called');
      if (!actor) throw new Error('Actor not available');
      const result = await (actor as any).completePendingUserSetup();
      console.log('[useCompletePendingUserSetup] User setup completed');
      return result;
    },
    onSuccess: (profile) => {
      console.log('[useCompletePendingUserSetup] Success, updating cache');
      queryClient.setQueryData(queryKeys.currentUserProfile, profile);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUserProfile });
    },
    onError: (error) => {
      console.error('[useCompletePendingUserSetup] Error:', error);
    },
    retry: false,
  });
}

// Users
export function useListUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: queryKeys.users,
    queryFn: async () => {
      console.log('[useListUsers] Fetching all users');
      if (!actor) {
        console.log('[useListUsers] Actor not available');
        throw new Error('Actor not available');
      }
      
      try {
        const users = await actor.getAllUsers();
        console.log('[useListUsers] Fetched users:', users.length);
        return users;
      } catch (error) {
        console.error('[useListUsers] Error fetching users:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; mobile: string; role: UserRole__1 }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createPendingUser(data.name, data.email, data.mobile, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userPrincipal: Principal; role: UserRole__1; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateUser(data.userPrincipal, data.role, data.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userPrincipal: Principal; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteUser(data.userPrincipal, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

// Projects
export function useListProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getAllProjects();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Omit<Project, 'id'>) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createProject(project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateProject(project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectId: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteProject(data.projectId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

// Contractors
export function useListContractors() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Contractor[]>({
    queryKey: queryKeys.contractors,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getAllContractors();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateContractor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractor: Omit<Contractor, 'id'>) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createContractor(contractor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contractors });
    },
  });
}

export function useUpdateContractor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractor: Contractor) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateContractor(contractor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contractors });
    },
  });
}

export function useDeleteContractor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { contractorId: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteContractor(data.contractorId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contractors });
    },
  });
}

// Bills
export function useListBills() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Bill[]>({
    queryKey: queryKeys.bills,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getAllBills();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Omit<Bill, 'id' | 'billNumber' | 'createdBy'>) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createBill(bill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    },
  });
}

export function useApproveBillPM() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { billId: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveBillPM(data.billId, data.approved, data.debit, data.note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    },
  });
}

export function useApproveBillQC() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { billId: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveBillQC(data.billId, data.approved, data.debit, data.note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    },
  });
}

export function useApproveBillBilling() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { billId: string; approved: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveBillBilling(data.billId, data.approved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
    },
  });
}

export function useDeleteBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { billId: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteBill(data.billId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    },
  });
}

// NMRs
export function useListNMRs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<NMR[]>({
    queryKey: queryKeys.nmrs,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getAllNMRs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateNMR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nmr: Omit<NMR, 'id' | 'createdBy'>) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createNMR(nmr);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nmrs });
    },
  });
}

export function useApproveNMRPM() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nmrId: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveNMRPM(data.nmrId, data.approved, data.debit, data.note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nmrs });
    },
  });
}

export function useApproveNMRQC() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nmrId: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveNMRQC(data.nmrId, data.approved, data.debit, data.note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nmrs });
    },
  });
}

export function useApproveNMRBilling() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nmrId: string; approved: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveNMRBilling(data.nmrId, data.approved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nmrs });
    },
  });
}

export function useDeleteNMR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nmrId: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteNMR(data.nmrId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nmrs });
    },
  });
}

// Payments
export function useListPayments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: queryKeys.payments,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getAllPayments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'paymentId' | 'createdBy'>) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createPayment(payment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
    },
  });
}

export function useDeletePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { paymentId: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deletePayment(data.paymentId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
    },
  });
}

// Dashboard Stats
export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getDashboardStats();
    },
    enabled: !!actor && !actorFetching,
  });
}

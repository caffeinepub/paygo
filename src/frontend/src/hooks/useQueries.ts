import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Project, Contractor, Bill, NMR, Payment, NMREntry, UserRole } from '../backend';
import { Principal } from '@dfinity/principal';

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
        const result = await actor.getCallerUserProfile();
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
      const result = await actor.getOrCreateMainAdminUser();
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
      return actor.saveCallerUserProfile(profile);
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
      const result = await actor.completePendingUserSetup();
      console.log('[useCompletePendingUserSetup] User setup completed');
      return result;
    },
    onSuccess: (profile) => {
      console.log('[useCompletePendingUserSetup] Success, updating cache');
      // Immediately set the cached profile to avoid intermediate states
      queryClient.setQueryData(queryKeys.currentUserProfile, profile);
      // Also invalidate to ensure consistency
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
      if (!actor) return [];
      const users = await actor.listUsers();
      console.log('[useListUsers] Fetched users from backend:', users.length, users);
      return users;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; mobile: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend createUser only accepts name, email, mobile
      // It creates a pending user that will be bound to a principal when they log in
      console.log('[useCreateUser] Creating pending user:', data);
      return actor.createUser(data.name, data.email, data.mobile);
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
    mutationFn: async (data: {
      userPrincipal: Principal;
      name: string;
      email: string;
      mobile: string;
      role: UserRole;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useUpdateUser] Updating user:', data.userPrincipal.toString());
      return actor.updateUser(
        data.userPrincipal,
        data.name,
        data.email,
        data.mobile,
        data.role,
        data.isActive
      );
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
      console.log('[useDeleteUser] Deleting user:', data.userPrincipal.toString());
      return actor.deleteUser(data.userPrincipal, data.password);
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
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectName: string;
      clientName: string;
      startDate: string;
      estimatedBudget: number;
      contactNumber: string;
      siteAddress: string;
      locationLink1: string;
      officeAddress: string;
      locationLink2: string;
      note: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(
        data.projectName,
        data.clientName,
        data.startDate,
        data.estimatedBudget,
        data.contactNumber,
        data.siteAddress,
        data.locationLink1,
        data.officeAddress,
        data.locationLink2,
        data.note
      );
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
    mutationFn: async (data: {
      id: string;
      projectName: string;
      clientName: string;
      startDate: string;
      estimatedBudget: number;
      contactNumber: string;
      siteAddress: string;
      locationLink1: string;
      officeAddress: string;
      locationLink2: string;
      note: string;
      status: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProject(
        data.id,
        data.projectName,
        data.clientName,
        data.startDate,
        data.estimatedBudget,
        data.contactNumber,
        data.siteAddress,
        data.locationLink1,
        data.officeAddress,
        data.locationLink2,
        data.note,
        data.status
      );
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
    mutationFn: async (data: { id: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProject(data.id, data.password);
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
      if (!actor) return [];
      return actor.listContractors();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateContractor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: string;
      project: string;
      contractorName: string;
      trade: string;
      unit: string;
      unitPrice: number;
      estimatedQty: number;
      estimatedAmount: number;
      mobile: string;
      email: string;
      address: string;
      attachments: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createContractor(
        data.date,
        data.project,
        data.contractorName,
        data.trade,
        data.unit,
        data.unitPrice,
        data.estimatedQty,
        data.estimatedAmount,
        data.mobile,
        data.email,
        data.address,
        data.attachments
      );
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
    mutationFn: async (data: {
      id: string;
      date: string;
      project: string;
      contractorName: string;
      trade: string;
      unit: string;
      unitPrice: number;
      estimatedQty: number;
      estimatedAmount: number;
      mobile: string;
      email: string;
      address: string;
      attachments: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateContractor(
        data.id,
        data.date,
        data.project,
        data.contractorName,
        data.trade,
        data.unit,
        data.unitPrice,
        data.estimatedQty,
        data.estimatedAmount,
        data.mobile,
        data.email,
        data.address,
        data.attachments
      );
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
    mutationFn: async (data: { id: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteContractor(data.id, data.password);
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
      if (!actor) return [];
      return actor.listBills();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      contractor: string;
      project: string;
      projectDate: string;
      trade: string;
      unit: string;
      unitPrice: number;
      quantity: number;
      description: string;
      location: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBill(
        data.contractor,
        data.project,
        data.projectDate,
        data.trade,
        data.unit,
        data.unitPrice,
        data.quantity,
        data.description,
        data.location
      );
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
    mutationFn: async (data: { id: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveBillPM(data.id, data.approved, data.debit, data.note);
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
    mutationFn: async (data: { id: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveBillQC(data.id, data.approved, data.debit, data.note);
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
    mutationFn: async (data: { id: string; approved: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveBillBilling(data.id, data.approved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    },
  });
}

export function useDeleteBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBill(data.id, data.password);
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
      if (!actor) return [];
      return actor.listNMRs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateNMR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      project: string;
      contractor: string;
      weekStartDate: string;
      weekEndDate: string;
      entries: NMREntry[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNMR(
        data.project,
        data.contractor,
        data.weekStartDate,
        data.weekEndDate,
        data.entries
      );
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
    mutationFn: async (data: { id: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveNMRPM(data.id, data.approved, data.debit, data.note);
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
    mutationFn: async (data: { id: string; approved: boolean; debit: number; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveNMRQC(data.id, data.approved, data.debit, data.note);
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
    mutationFn: async (data: { id: string; approved: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveNMRBilling(data.id, data.approved);
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
    mutationFn: async (data: { id: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNMR(data.id, data.password);
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
      if (!actor) return [];
      return actor.listPayments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      billNumber: string;
      paymentDate: string;
      paidAmount: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPayment(
        data.billNumber,
        data.paymentDate,
        data.paidAmount
      );
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
    mutationFn: async (data: { id: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePayment(data.id, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
    },
  });
}

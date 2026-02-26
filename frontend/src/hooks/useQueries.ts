import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserRole, Project, Contractor, Bill, NMR, Payment } from '../backend';
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

// -----------------------------------------------------------------------
// Login - auto-creates profile if it doesn't exist
// -----------------------------------------------------------------------
export function useLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.login();
    },
    onSuccess: (profile) => {
      // Cache the profile immediately so getCallerUserProfile doesn't need to re-fetch
      queryClient.setQueryData(queryKeys.currentUserProfile, profile);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUserProfile });
    },
    retry: false,
  });
}

// -----------------------------------------------------------------------
// Current User Profile
// -----------------------------------------------------------------------
export function useGetCallerUserProfile(authRequired: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: queryKeys.currentUserProfile,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.getCallerUserProfile();
        return result;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        // If the error is about not being registered/authorized, return null
        // so RootLayout can trigger login() to auto-create the profile
        if (
          msg.includes('not found') ||
          msg.includes('Unauthorized') ||
          msg.includes('registered') ||
          msg.includes('profile setup') ||
          msg.includes('Anonymous')
        ) {
          return null;
        }
        throw error;
      }
    },
    enabled: authRequired && !!actor && !actorFetching,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });

  const isLoading = authRequired ? (actorFetching || query.isLoading) : false;
  const isFetched = authRequired ? (!!actor && query.isFetched) : true;

  return {
    ...query,
    isLoading,
    isFetched,
  };
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

// -----------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------
export function useListUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: queryKeys.users,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30000,
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userPrincipal: Principal; role: UserRole; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserRole(data.userPrincipal, data.role, data.isActive);
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
      return actor.deleteUser(data.userPrincipal, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

// -----------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------
export function useListProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllProjects();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30000,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(project);
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
      return actor.updateProject(project);
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
      return actor.deleteProject(data.projectId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

// -----------------------------------------------------------------------
// Contractors
// -----------------------------------------------------------------------
export function useListContractors() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Contractor[]>({
    queryKey: queryKeys.contractors,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllContractors();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30000,
  });
}

export function useCreateContractor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractor: Contractor) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createContractor(contractor);
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
      return actor.updateContractor(contractor);
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
      return actor.deleteContractor(data.contractorId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contractors });
    },
  });
}

// -----------------------------------------------------------------------
// Bills
// -----------------------------------------------------------------------
export function useListBills() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Bill[]>({
    queryKey: queryKeys.bills,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBills();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30000,
  });
}

export function useCreateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Bill) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBill(bill);
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
    mutationFn: async (data: { billId: string; pmApproved: boolean; pmDebit: number; pmNote: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBillPMApproval(data.billId, data.pmApproved, data.pmDebit, data.pmNote);
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
    mutationFn: async (data: { billId: string; qcApproved: boolean; qcDebit: number; qcNote: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBillQCApproval(data.billId, data.qcApproved, data.qcDebit, data.qcNote);
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
    mutationFn: async (data: { billId: string; billingApproved: boolean; finalAmount: number; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBillBillingApproval(data.billId, data.billingApproved, data.finalAmount, data.status);
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
    mutationFn: async (data: { billId: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBill(data.billId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    },
  });
}

// -----------------------------------------------------------------------
// NMRs
// -----------------------------------------------------------------------
export function useListNMRs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<NMR[]>({
    queryKey: queryKeys.nmrs,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllNMRs();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30000,
  });
}

export function useCreateNMR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nmr: NMR) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNMR(nmr);
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
    mutationFn: async (data: { nmrId: string; pmApproved: boolean; pmDebit: number; pmNote: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNMRPMApproval(data.nmrId, data.pmApproved, data.pmDebit, data.pmNote);
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
    mutationFn: async (data: { nmrId: string; qcApproved: boolean; qcDebit: number; qcNote: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNMRQCApproval(data.nmrId, data.qcApproved, data.qcDebit, data.qcNote);
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
    mutationFn: async (data: { nmrId: string; billingApproved: boolean; finalAmount: number; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNMRBillingApproval(data.nmrId, data.billingApproved, data.finalAmount, data.status);
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
      return actor.deleteNMR(data.nmrId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nmrs });
    },
  });
}

// -----------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------
export function useListPayments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: queryKeys.payments,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPayments();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 30000,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Payment) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPayment(payment);
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
      return actor.deletePayment(data.paymentId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
    },
  });
}

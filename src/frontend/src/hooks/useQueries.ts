import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, User, Project, Contractor, Bill, NMR, Payment, NMREntry, UserRole } from '../backend';
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
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: queryKeys.currentUserProfile,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useBootstrapMainAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrCreateMainAdminUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUserProfile });
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

// Users
export function useListUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User[]>({
    queryKey: queryKeys.users,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; mobile: string; userPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(data.name, data.email, data.mobile, data.userPrincipal);
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
    mutationFn: async (data: Omit<Project, 'id' | 'status'>) => {
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
    mutationFn: async (data: Project) => {
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
    mutationFn: async (data: Omit<Contractor, 'id'>) => {
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
    mutationFn: async (data: Contractor) => {
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

// NMR
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
    mutationFn: async (data: { billNumber: string; paymentDate: string; paidAmount: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPayment(data.billNumber, data.paymentDate, data.paidAmount);
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

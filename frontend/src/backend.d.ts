import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NMR {
    id: string;
    status: string;
    trade: string;
    finalAmount: number;
    pmDebit: number;
    weekStartDate: string;
    createdBy: Principal;
    qcDebit: number;
    pmApproved: boolean;
    qcNote: string;
    engineerName: string;
    entries: Array<NMREntry>;
    pmNote: string;
    billingApproved: boolean;
    weekEndDate: string;
    qcApproved: boolean;
    contractor: string;
    project: string;
}
export interface NMREntry {
    hours: number;
    date: string;
    duty: string;
    rate: number;
    labourType: string;
    amount: number;
    noOfPersons: number;
}
export interface Contractor {
    id: string;
    trade: string;
    date: string;
    unit: string;
    estimatedQty: number;
    email: string;
    address: string;
    mobile: string;
    unitPrice: number;
    attachments: Array<string>;
    contractorName: string;
    project: string;
    estimatedAmount: number;
}
export interface Bill {
    id: string;
    status: string;
    total: number;
    trade: string;
    finalAmount: number;
    projectDate: string;
    pmDebit: number;
    createdBy: Principal;
    unit: string;
    qcDebit: number;
    pmApproved: boolean;
    description: string;
    qcNote: string;
    billNumber: string;
    quantity: number;
    pmNote: string;
    unitPrice: number;
    billingApproved: boolean;
    qcApproved: boolean;
    location: string;
    authorizedEngineer: string;
    contractor: string;
    project: string;
}
export interface Project {
    id: string;
    status: string;
    projectName: string;
    clientName: string;
    officeAddress: string;
    note: string;
    siteAddress: string;
    contactNumber: string;
    locationLink1: string;
    locationLink2: string;
    estimatedBudget: number;
    startDate: string;
}
export interface Payment {
    id: string;
    status: string;
    balance: number;
    createdBy: Principal;
    billTotal: number;
    paymentId: string;
    billNumber: string;
    paymentDate: string;
    paidAmount: number;
    contractor: string;
    project: string;
}
export interface UserProfile {
    principal: Principal;
    name: string;
    createdAt: bigint;
    role: UserRole;
    isActive: boolean;
    email: string;
    mobile: string;
    payGoId: string;
}
export enum UserRole {
    qc = "qc",
    admin = "admin",
    projectManager = "projectManager",
    billingEngineer = "billingEngineer",
    viewer = "viewer",
    siteEngineer = "siteEngineer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createBill(bill: Bill): Promise<Bill>;
    createContractor(contractor: Contractor): Promise<Contractor>;
    createNMR(nmr: NMR): Promise<NMR>;
    createPayment(payment: Payment): Promise<Payment>;
    createProject(project: Project): Promise<Project>;
    deleteBill(id: string, password: string): Promise<void>;
    deleteContractor(id: string, password: string): Promise<void>;
    deleteNMR(id: string, password: string): Promise<void>;
    deletePayment(id: string, password: string): Promise<void>;
    deleteProject(id: string, password: string): Promise<void>;
    deleteUser(targetUser: Principal, password: string): Promise<void>;
    getAllBills(): Promise<Array<Bill>>;
    getAllContractors(): Promise<Array<Contractor>>;
    getAllNMRs(): Promise<Array<NMR>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllProjects(): Promise<Array<Project>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(): Promise<UserProfile>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBillBillingApproval(billId: string, billingApproved: boolean, finalAmount: number, status: string): Promise<Bill>;
    updateBillPMApproval(billId: string, pmApproved: boolean, pmDebit: number, pmNote: string): Promise<Bill>;
    updateBillQCApproval(billId: string, qcApproved: boolean, qcDebit: number, qcNote: string): Promise<Bill>;
    updateContractor(contractor: Contractor): Promise<Contractor>;
    updateNMRBillingApproval(nmrId: string, billingApproved: boolean, finalAmount: number, status: string): Promise<NMR>;
    updateNMRPMApproval(nmrId: string, pmApproved: boolean, pmDebit: number, pmNote: string): Promise<NMR>;
    updateNMRQCApproval(nmrId: string, qcApproved: boolean, qcDebit: number, qcNote: string): Promise<NMR>;
    updateProject(project: Project): Promise<Project>;
    updateUserRole(targetUser: Principal, newRole: UserRole, isActive: boolean): Promise<void>;
}

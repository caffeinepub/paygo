import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface User {
    principal: Principal;
    name: string;
    role: UserRole;
    isActive: boolean;
    email: string;
    mobile: string;
    payGoId: string;
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
    name: string;
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
    approveBillBilling(id: string, approved: boolean): Promise<void>;
    approveBillPM(id: string, approved: boolean, debit: number, note: string): Promise<void>;
    approveBillQC(id: string, approved: boolean, debit: number, note: string): Promise<void>;
    approveNMRBilling(id: string, approved: boolean): Promise<void>;
    approveNMRPM(id: string, approved: boolean, debit: number, note: string): Promise<void>;
    approveNMRQC(id: string, approved: boolean, debit: number, note: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createBill(contractor: string, project: string, projectDate: string, trade: string, unit: string, unitPrice: number, quantity: number, description: string, location: string): Promise<string>;
    createContractor(date: string, project: string, contractorName: string, trade: string, unit: string, unitPrice: number, estimatedQty: number, estimatedAmount: number, mobile: string, email: string, address: string, attachments: Array<string>): Promise<string>;
    createNMR(project: string, contractor: string, weekStartDate: string, weekEndDate: string, entries: Array<NMREntry>): Promise<string>;
    createPayment(billNumber: string, paymentDate: string, paidAmount: number): Promise<string>;
    createProject(projectName: string, clientName: string, startDate: string, estimatedBudget: number, contactNumber: string, siteAddress: string, locationLink1: string, officeAddress: string, locationLink2: string, note: string): Promise<string>;
    createUser(name: string, email: string, mobile: string, userPrincipal: Principal): Promise<string>;
    deleteBill(id: string, password: string): Promise<void>;
    deleteContractor(id: string, password: string): Promise<void>;
    deleteNMR(id: string, password: string): Promise<void>;
    deletePayment(id: string, password: string): Promise<void>;
    deleteProject(id: string, password: string): Promise<void>;
    deleteUser(userPrincipal: Principal, password: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getOrCreateMainAdminUser(): Promise<UserProfile>;
    getUserProfile(userPrincipal: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listBills(): Promise<Array<Bill>>;
    listContractors(): Promise<Array<Contractor>>;
    listNMRs(): Promise<Array<NMR>>;
    listPayments(): Promise<Array<Payment>>;
    listProjects(): Promise<Array<Project>>;
    listUsers(): Promise<Array<User>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateContractor(id: string, date: string, project: string, contractorName: string, trade: string, unit: string, unitPrice: number, estimatedQty: number, estimatedAmount: number, mobile: string, email: string, address: string, attachments: Array<string>): Promise<void>;
    updateProject(id: string, projectName: string, clientName: string, startDate: string, estimatedBudget: number, contactNumber: string, siteAddress: string, locationLink1: string, officeAddress: string, locationLink2: string, note: string, status: string): Promise<void>;
    updateUser(userPrincipal: Principal, name: string, email: string, mobile: string, role: UserRole, isActive: boolean): Promise<void>;
}

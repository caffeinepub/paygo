import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    principal: Principal;
    name: string;
    createdAt: bigint;
    role: UserRole__1;
    isActive: boolean;
    email: string;
    mobile: string;
    payGoId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserRole__1 {
    qc = "qc",
    admin = "admin",
    projectManager = "projectManager",
    billingEngineer = "billingEngineer",
    viewer = "viewer",
    siteEngineer = "siteEngineer"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
}

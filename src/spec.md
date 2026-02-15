# Specification

## Summary
**Goal:** Remove the circular dependency where the Users module is admin-only but the initial Admin user does not exist yet by bootstrapping a main admin user on first Internet Identity login for a specific email.

**Planned changes:**
- Backend: Add a callable bootstrap method (e.g., `bootstrapMainAdminOnFirstLogin`) that, when invoked after Internet Identity login, creates the main admin user only if (1) the caller has no user record and (2) no existing user with email `jogaraoseri.er@mktconstructions.com` exists; set role to admin, active status true, generate a payGoId, and store the caller principal.
- Backend: Ensure the bootstrap is idempotent/safe to call multiple times and that authorization checks recognize the created principal as admin for admin-only actions.
- Frontend: After authentication, when the current profile query returns null, call the bootstrap method once and, on success, refetch the profile and enter the main app shell without showing the Create Profile screen for the bootstrap admin case.
- Frontend: Keep existing ProfileSetup behavior for non-eligible users (i.e., when main admin already exists and the caller has no profile), and avoid showing “User not found” for the successful bootstrap admin path.
- Preserve existing behavior for all other users: no general self-signup; non-main-admin users must still be created by an Admin and remain subject to existing RBAC and messaging (including deactivation text).

**User-visible outcome:** On first login with Internet Identity as `jogaraoseri.er@mktconstructions.com`, the app automatically creates and signs in the main Admin (no Create Profile screen / no “User not found” for this path), enabling immediate access to admin-only user management; all other users continue to require admin-created accounts.

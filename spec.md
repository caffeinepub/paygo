# PayGo – Fix Admin AccessControl Bootstrap Bug

## Current State
Backend `login()` has a bootstrap path for the first caller (admin). It sets `bootstrapDone=true` and returns `#admin` role but NEVER calls `AccessControl.assignRole`. So the admin principal has no entry in AccessControl.

Then `getCallerUserProfile()` checks `AccessControl.hasPermission(caller, #user)` — admin doesn't have `#user` permission → throws "Unauthorized" → frontend catches and returns null → profile never loads → sidebar stays in loading state forever.

Same issue in `saveCallerUserProfile()` and `getAllUsers()` which check AccessControl.

Also: index route redirects to `/users` — non-admin users will always hit a permission error there.

`useLogin()` onSuccess only invalidates `currentUserProfile`, not `users` — so after login, the users list doesn't refetch.

## Requested Changes (Diff)

### Add
- In `login()` bootstrap admin path: call `AccessControl.assignRole(accessControlState, caller, caller, #admin)`
- In `saveCallerUserProfile()`: if email == MAIN_ADMIN_EMAIL, force role to #admin and update AccessControl
- In `updateUserRole()`: block downgrading if target user email == MAIN_ADMIN_EMAIL

### Modify
- `getCallerUserProfile()`: check for `#user` OR `#admin` permission (not just `#user`)
- `saveCallerUserProfile()`: same permission check
- Index route: redirect to `/dashboard` instead of `/users`
- `useLogin()` onSuccess: also invalidate `users` and `projects` query keys
- `useListUsers()`: increase retryDelay to 2000ms

### Remove
- Nothing removed

## Implementation Plan
1. Fix `main.mo`: add `AccessControl.assignRole` call for admin in `login()`
2. Fix `main.mo`: update `getCallerUserProfile` and `saveCallerUserProfile` to accept #admin
3. Fix `main.mo`: protect main admin from downgrade in `updateUserRole`
4. Fix `main.mo`: in `saveCallerUserProfile`, auto-promote if email == MAIN_ADMIN_EMAIL
5. Fix `App.tsx`: index redirect → `/dashboard`
6. Fix `useQueries.ts`: invalidate `users` in login onSuccess; add retryDelay

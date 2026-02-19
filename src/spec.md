# Specification

## Summary
**Goal:** Fix the users list page to display all 7 added users instead of only showing 2 users.

**Planned changes:**
- Remove any pagination limits or query restrictions that prevent displaying all users
- Ensure the users list API endpoint returns all users without artificial limits
- Verify the frontend correctly renders all users returned from the backend

**User-visible outcome:** Users can see all 7 added users in the users list table with their complete details (PayGo ID, Name, Email, Mobile, Role, Status).

# Specification

## Summary
**Goal:** Fix Users module to prevent principal_id collisions and ensure all user records are stored and displayed correctly without overwriting.

**Planned changes:**
- Capture and store the actual logged-in principal from Internet Identity when users complete profile setup, ensuring each authenticated user receives their unique principal_id
- Prevent manual user creation from assigning the admin's principal_id; leave principal_id empty or use a temporary unique placeholder for manually created users
- Ensure backend always inserts new user records using a unique user ID as primary key, never overwriting existing users based on principal_id
- Fix Users list query to fetch and display all user records from the database without filtering or collapsing duplicates

**User-visible outcome:** All users appear correctly in the Users list, each with their unique identity. Manually created users and authenticated users coexist without collision. No user records disappear or get overwritten when new users are added.

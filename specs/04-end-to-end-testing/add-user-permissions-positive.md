# Add User Permissions Positive Test

## Test Name
Add User to Project Permissions - Successful Addition

## Description
This test verifies that a project owner can successfully add a registered user to the project's permission list by entering the user's email address. Only registered users can be added.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User A (project owner) is logged in and authenticated
4. User A is in Project Editor for a test project (Permissions tab is active)
5. User B exists in the system as a registered user (created before test, email: `test-user-collaborator-${timestamp}@example.com`)
6. User B does not currently have permissions for the test project
7. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load
- Expected State: Project Editor displays with Permissions tab active
- Assertions:
  - Verify "Permissions" tab is active
  - Verify user list is visible showing project owner
  - Verify "Add user" button is visible

**Step 2: Click Add User Button**
- Action: Click "Add user" button
- Expected State: Add user interface is displayed
- Assertions:
  - Verify add user interface is displayed (modal, form, or inline form)
  - Verify email input field is visible
  - Verify "Add" or "Confirm" button is visible
  - Verify "Cancel" button is visible (if applicable)

**Step 3: Enter User Email**
- Action: Enter email address: `test-user-collaborator-${timestamp}@example.com`
- Expected State: Email input contains entered email
- Assertions:
  - Verify email input field contains the entered email
  - Verify email input is editable

**Step 4: Submit Add User**
- Action: Click "Add" or "Confirm" button
- Expected State: User is added to permissions list
- Assertions:
  - Wait for user to appear in permissions list
  - Verify add user interface is closed
  - Verify user is added to permissions list

**Step 5: Verify User in Permissions List**
- Action: Verify added user appears in user list
- Expected State: Added user is displayed in user list
- Assertions:
  - Verify User B appears in user list
  - Verify User B's email is displayed correctly
  - Verify user list shows both project owner and added user
  - Verify user count increased by 1

**Step 6: Verify Permission Persistence**
- Action: Refresh page or switch tabs and return to Permissions tab
- Expected State: Added user persists in permissions list
- Assertions:
  - Verify User B still appears in user list after refresh
  - Verify permission is persisted in database
  - Verify user list is accurate

## Expected Results
1. "Add user" button is visible and clickable
2. Add user interface is displayed correctly
3. Email input accepts valid email address
4. User addition succeeds for registered user
5. Added user appears in permissions list immediately
6. Permission is persisted in database
7. Added user persists after page refresh

## Assertions
1. "Add user" button is accessible and functional
2. Add user interface is displayed correctly
3. Email input field accepts and validates input
4. User addition succeeds for registered user
5. Added user appears in user list
6. Permission is created in database
7. Permission persists after page refresh
8. User list accurately reflects permissions

## Error Scenarios
This is a positive test case. Error scenarios are covered in `add-user-permissions-negative.md`.

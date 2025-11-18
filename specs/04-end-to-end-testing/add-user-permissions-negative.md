# Add User Permissions Negative Test

## Test Name
Add User to Project Permissions - Error Cases

## Description
This test verifies that the system properly handles error conditions when attempting to add users to project permissions. It tests non-existent users, invalid email formats, duplicate permissions, and non-owner access attempts.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User A (project owner) is logged in and authenticated
4. User A is in Project Editor for a test project (Permissions tab is active)
5. User B exists in the system and already has permissions for the test project (for duplicate test)
6. User C does NOT exist in the system (for non-existent user test)
7. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Non-Existent User

**Step 1.1: Click Add User Button**
- Action: Click "Add user" button
- Expected State: Add user interface is displayed
- Assertions:
  - Verify add user interface is displayed

**Step 1.2: Enter Non-Existent User Email**
- Action: Enter email address: `nonexistent-user-${timestamp}@example.com` (user does not exist in system)
- Expected State: Email input contains entered email
- Assertions:
  - Verify email input field contains entered email

**Step 1.3: Submit Add User**
- Action: Click "Add" or "Confirm" button
- Expected State: User addition is rejected
- Assertions:
  - Verify error message is displayed: "User not registered"
  - Verify user is not added to permissions list
  - Verify add user interface may remain open or close with error

### Test Case 2: Invalid Email Format

**Step 2.1: Click Add User Button**
- Action: Click "Add user" button
- Expected State: Add user interface is displayed
- Assertions:
  - Verify add user interface is displayed

**Step 2.2: Enter Invalid Email Format**
- Action: Enter invalid email: `invalid-email-format` (missing @ and domain)
- Expected State: Email input contains entered value
- Assertions:
  - Verify email input field contains entered value

**Step 2.3: Submit Add User**
- Action: Click "Add" or "Confirm" button
- Expected State: User addition is rejected
- Assertions:
  - Verify error message is displayed: "Invalid email format"
  - Verify user is not added to permissions list

### Test Case 3: Duplicate Permissions

**Step 3.1: Click Add User Button**
- Action: Click "Add user" button
- Expected State: Add user interface is displayed
- Assertions:
  - Verify add user interface is displayed

**Step 3.2: Enter User with Existing Permissions**
- Action: Enter email address of User B (who already has permissions)
- Expected State: Email input contains entered email
- Assertions:
  - Verify email input field contains User B's email

**Step 3.3: Submit Add User**
- Action: Click "Add" or "Confirm" button
- Expected State: User addition is rejected
- Assertions:
  - Verify error message is displayed: "User already has permissions"
  - Verify user is not added again to permissions list
  - Verify user list count remains unchanged

### Test Case 4: Empty Email

**Step 4.1: Click Add User Button**
- Action: Click "Add user" button
- Expected State: Add user interface is displayed
- Assertions:
  - Verify add user interface is displayed

**Step 4.2: Leave Email Empty**
- Action: Do not enter email, or clear email field
- Expected State: Email input is empty
- Assertions:
  - Verify email input field is empty

**Step 4.3: Submit Add User**
- Action: Click "Add" or "Confirm" button
- Expected State: User addition is rejected
- Assertions:
  - Verify error message is displayed: "Email is required" or "Invalid email format"
  - Verify user is not added to permissions list

### Test Case 5: Non-Owner Attempt (If Applicable)

**Step 5.1: Login as Non-Owner**
- Action: Log out and log in as User B (who has permissions but is not owner)
- Expected State: User B is logged in
- Assertions:
  - Verify User B is authenticated

**Step 5.2: Navigate to Project Editor**
- Action: Open Project Editor for the test project
- Expected State: Project Editor is displayed
- Assertions:
  - Verify Project Editor is accessible (User B has permissions)

**Step 5.3: Navigate to Permissions Tab**
- Action: Click on "Permissions" tab
- Expected State: Permissions tab is displayed
- Assertions:
  - Verify Permissions tab is displayed
  - Verify "Add user" button is NOT visible (only project owner can add users)

**Note**: If "Add user" button is visible but disabled, verify that clicking it shows error "Only project owner can add users".

## Expected Results
1. Non-existent user is rejected with "User not registered" message
2. Invalid email format is rejected with "Invalid email format" message
3. Duplicate permissions are rejected with "User already has permissions" message
4. Empty email is rejected with validation error
5. Non-owner users cannot add users (button not visible or error shown)
6. Error messages are displayed and visible to user
7. Permissions list remains unchanged for all error cases

## Assertions
1. Error messages match specifications exactly:
   - "User not registered" for non-existent users
   - "Invalid email format" for invalid email format
   - "User already has permissions" for duplicate permissions
   - "Only project owner can add users" for non-owner attempts
2. No permission is created for any error case
3. Error messages are user-friendly and actionable
4. Permissions list remains unchanged after errors
5. No database updates occur for error cases

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Non-existent user handling
- Invalid email format validation
- Duplicate permissions detection
- Required field validation (empty email)
- Authorization check (only project owner can add users)

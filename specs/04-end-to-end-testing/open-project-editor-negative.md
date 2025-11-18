# Open Project Editor Negative Test

## Test Name
Open Project Editor - Error Cases

## Description
This test verifies that the system properly handles error conditions when attempting to open the Project Editor. It tests access denial for projects the user doesn't have permission to access, and handling of deleted or non-existent projects.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User A is logged in and authenticated (on Home Screen)
4. User B exists in the system with a project that User A does not have access to
5. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Access Denied - No Permission

**Step 1.1: Attempt to Access Project Without Permission**
- Action: If User A can see User B's project in some way (should not happen due to user isolation), or if URL manipulation is attempted, try to access User B's project
- Expected State: Access is denied
- Assertions:
  - Verify error message is displayed: "Access denied" or "You do not have permission to view this project"
  - Verify user is redirected to Home Screen or remains on Home Screen
  - Verify Project Editor is not displayed

**Note**: Due to user isolation, User A should not see User B's project in the project list. This test case may require direct URL access or API manipulation to test.

### Test Case 2: Project Not Found (If Applicable)

**Step 2.1: Attempt to Access Non-Existent Project**
- Action: Try to access a project that doesn't exist (via URL manipulation or if project was deleted)
- Expected State: Error is displayed
- Assertions:
  - Verify error message is displayed: "Project not found"
  - Verify user is redirected to Home Screen
  - Verify Project Editor is not displayed

### Test Case 3: Session Expired (If Applicable)

**Step 3.1: Let Session Expire**
- Action: Wait for session to expire or manually invalidate session
- Expected State: Session is invalid
- Assertions:
  - Verify session is invalidated

**Step 3.2: Attempt to Open Project Editor**
- Action: Try to double-click a project or access Project Editor
- Expected State: User is redirected to Login Screen
- Assertions:
  - Verify user is redirected to Login Screen
  - Verify error message may be displayed: "Session expired" or "Please log in again"
  - Verify Project Editor is not displayed

## Expected Results
1. Access to projects without permission is denied
2. Access to non-existent projects shows "Project not found" error
3. Access with expired session redirects to Login Screen
4. Appropriate error messages are displayed
5. User is redirected to appropriate screen (Home Screen or Login Screen)
6. Project Editor is not displayed for error cases

## Assertions
1. Error messages match specifications exactly:
   - "Access denied" for projects without permission
   - "Project not found" for non-existent projects
   - Appropriate message for session expiration
2. User is redirected appropriately for each error case
3. Project Editor is not displayed for error cases
4. Application state remains consistent after errors

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Access denied for projects without permission
- Project not found handling
- Session expiration handling

Note: Due to user isolation enforcement, users should not see projects they don't have access to in the project list. Testing access denial may require direct URL manipulation or API testing.

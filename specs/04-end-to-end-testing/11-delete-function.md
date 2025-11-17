# Delete Function Test Scenarios

## Test ID: FUNC-DELETE-001
## Test Name: Delete Function - Positive Case
## Test Type: Positive
## Related Use Cases: Delete Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- User has permission to delete the function (is project owner or has appropriate permission)
- Project tab is active in Project Editor

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Select function "TestFunction" (click on it to select)
4. Locate delete action (delete button, right-click menu, or delete icon depending on UI implementation)
5. Click delete action
6. Verify confirmation dialog is displayed (if applicable) OR function is deleted immediately
7. If confirmation dialog is displayed, confirm deletion
8. Verify function "TestFunction" is removed from the function list
9. Verify function is deleted from the system
10. Verify all brick configurations belonging to the function are deleted
11. Verify no error messages are displayed

### Expected Results
- Function is selected successfully
- Delete action is available and clickable
- Confirmation is handled appropriately (if required)
- Function is removed from the function list immediately
- Function is deleted from the system
- All associated brick configurations are deleted
- No error messages are displayed

### Postconditions
- Function "TestFunction" no longer exists in the system
- Function is removed from the function list
- All brick configurations for the function are deleted
- User remains in Project Editor
- Other functions (if any) remain unaffected

---

## Test ID: FUNC-DELETE-002
## Test Name: Delete Function - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Delete Function

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Function "SharedFunction" exists in project "SharedProject"
- User "user@example.com" has permission to view the project but NOT to delete functions
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Project Editor for project "SharedProject"
- Project tab is active in Project Editor

### Test Data
- Function Name: "SharedFunction"
- Project Name: "SharedProject"

### Test Steps
1. Verify user "user@example.com" is in Project Editor with Project tab active
2. Verify function "SharedFunction" is displayed in the function list (if user has view permission)
3. Select function "SharedFunction"
4. Attempt to locate delete action
5. Verify delete action is not available OR delete fails when attempted
6. If delete action is attempted, verify error message "Permission denied" is displayed
7. Verify function "SharedFunction" remains in the function list
8. Verify function is not deleted
9. Verify no changes are made to the function

### Expected Results
- Function is visible to user (if user has view permission)
- Delete action is not available OR fails when attempted
- Error message "Permission denied" is displayed (if action is attempted)
- Function remains in the function list
- Function is not deleted
- Permission restrictions are enforced

### Postconditions
- Function "SharedFunction" remains in the system
- Function remains in the function list
- No changes are made to the function
- User remains in Project Editor
- Permission restrictions are maintained

---

## Test ID: FUNC-DELETE-003
## Test Name: Delete Function - Cancel Deletion
## Test Type: Positive (Edge Case)
## Related Use Cases: Delete Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- User has permission to delete the function
- Project tab is active in Project Editor

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Select function "TestFunction"
4. Locate delete action
5. Click delete action
6. Verify confirmation dialog is displayed (if applicable)
7. If confirmation dialog is displayed, click Cancel button or close the dialog
8. Verify deletion is cancelled
9. Verify function "TestFunction" remains in the function list
10. Verify function is not deleted
11. Verify no changes are made to the function
12. Verify no error messages are displayed

### Expected Results
- Delete action is initiated
- Confirmation dialog is displayed (if applicable)
- Cancel action works correctly
- Function remains in the function list
- Function is not deleted
- No changes are made
- No error messages are displayed

### Postconditions
- Function "TestFunction" remains in the system
- Function remains in the function list
- No changes are made to the function
- User remains in Project Editor

---

## Test ID: FUNC-DELETE-004
## Test Name: Delete Function - Verify Cascading Deletion
## Test Type: Positive (Verification)
## Related Use Cases: Delete Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- Function "TestFunction" contains at least one brick configuration
- User has permission to delete the function
- Project tab is active in Project Editor

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Note the brick configurations associated with the function (if visible or known)
4. Select function "TestFunction"
5. Click delete action
6. Confirm deletion (if confirmation is required)
7. Verify function "TestFunction" is deleted
8. Verify function is removed from the function list
9. Verify all brick configurations belonging to "TestFunction" are deleted
10. Verify no orphaned data remains in the system

### Expected Results
- Function is deleted successfully
- All associated brick configurations are deleted
- No orphaned data remains
- Cascading deletion works correctly

### Postconditions
- Function "TestFunction" no longer exists
- All brick configurations for the function are deleted
- No orphaned data remains in the system
- User remains in Project Editor

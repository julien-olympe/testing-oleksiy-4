# Delete Project Test Scenarios

## Test ID: PROJ-DELETE-001
## Test Name: Delete Project - Positive Case
## Test Type: Positive
## Related Use Cases: Delete Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to delete the project (is owner)

### Test Data
- Project Name: "TestProject"

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Select project "TestProject" (click on it to select)
4. Locate delete action (delete button, right-click menu, or delete icon depending on UI implementation)
5. Click delete action
6. Verify confirmation dialog is displayed (if applicable) OR project is deleted immediately
7. If confirmation dialog is displayed, confirm deletion
8. Verify project "TestProject" is removed from the project list
9. Verify project is deleted from the system
10. Verify all functions belonging to the project are deleted
11. Verify all database instances belonging to the project are deleted
12. Verify all permissions for the project are deleted
13. Verify no error messages are displayed

### Expected Results
- Project is selected successfully
- Delete action is available and clickable
- Confirmation is handled appropriately (if required)
- Project is removed from the project list immediately
- Project is deleted from the system
- All associated data (functions, instances, permissions) are deleted
- No error messages are displayed

### Postconditions
- Project "TestProject" no longer exists in the system
- Project is removed from the project list
- All functions, instances, and permissions for the project are deleted
- User remains on Home Screen
- Other projects (if any) remain unaffected

---

## Test ID: PROJ-DELETE-002
## Test Name: Delete Project - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Delete Project

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- User "user@example.com" has permission to view the project but NOT to delete it
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is on Home Screen
- Project "SharedProject" is visible to "user@example.com" (has view permission)

### Test Data
- Project Name: "SharedProject"

### Test Steps
1. Verify user "user@example.com" is on Home Screen
2. Verify project "SharedProject" is displayed in the project list (if user has view permission)
3. Select project "SharedProject"
4. Attempt to locate delete action
5. Verify delete action is not available OR delete fails when attempted
6. If delete action is attempted, verify error message "Permission denied" is displayed
7. Verify project "SharedProject" remains in the project list
8. Verify project is not deleted
9. Verify no changes are made to the project

### Expected Results
- Project is visible to user (if user has view permission)
- Delete action is not available OR fails when attempted
- Error message "Permission denied" is displayed (if action is attempted)
- Project remains in the project list
- Project is not deleted
- Permission restrictions are enforced

### Postconditions
- Project "SharedProject" remains in the system
- Project remains in the project list
- No changes are made to the project
- User remains on Home Screen
- Permission restrictions are maintained

---

## Test ID: PROJ-DELETE-003
## Test Name: Delete Project - Cancel Deletion
## Test Type: Positive (Edge Case)
## Related Use Cases: Delete Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to delete the project

### Test Data
- Project Name: "TestProject"

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Select project "TestProject"
4. Locate delete action
5. Click delete action
6. Verify confirmation dialog is displayed (if applicable)
7. If confirmation dialog is displayed, click Cancel button or close the dialog
8. Verify deletion is cancelled
9. Verify project "TestProject" remains in the project list
10. Verify project is not deleted
11. Verify no changes are made to the project
12. Verify no error messages are displayed

### Expected Results
- Delete action is initiated
- Confirmation dialog is displayed (if applicable)
- Cancel action works correctly
- Project remains in the project list
- Project is not deleted
- No changes are made
- No error messages are displayed

### Postconditions
- Project "TestProject" remains in the system
- Project remains in the project list
- No changes are made to the project
- User remains on Home Screen

---

## Test ID: PROJ-DELETE-004
## Test Name: Delete Project - Verify Cascading Deletion
## Test Type: Positive (Verification)
## Related Use Cases: Delete Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- Project "TestProject" contains at least one function
- Project "TestProject" contains at least one database instance
- Project "TestProject" has at least one permission granted to another user
- User has permission to delete the project

### Test Data
- Project Name: "TestProject"

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Note the number of functions, instances, and permissions associated with the project (if visible)
4. Select project "TestProject"
5. Click delete action
6. Confirm deletion (if confirmation is required)
7. Verify project "TestProject" is deleted
8. Verify project is removed from the project list
9. Verify all functions belonging to "TestProject" are deleted
10. Verify all database instances belonging to "TestProject" are deleted
11. Verify all permissions for "TestProject" are deleted
12. Verify no orphaned data remains in the system

### Expected Results
- Project is deleted successfully
- All associated functions are deleted
- All associated database instances are deleted
- All associated permissions are deleted
- No orphaned data remains
- Cascading deletion works correctly

### Postconditions
- Project "TestProject" no longer exists
- All functions, instances, and permissions for the project are deleted
- No orphaned data remains in the system
- User remains on Home Screen

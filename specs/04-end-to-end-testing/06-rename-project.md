# Rename Project Test Scenarios

## Test ID: PROJ-RENAME-001
## Test Name: Rename Project - Positive Case
## Test Type: Positive
## Related Use Cases: Rename Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to rename the project (is owner)

### Test Data
- Original Project Name: "TestProject"
- New Project Name: "Renamed Project"

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Select project "TestProject" (click on it to select)
4. Initiate rename action (click rename button, right-click menu, or double-click name depending on UI implementation)
5. Verify project name becomes editable (input field appears or name becomes editable inline)
6. Clear existing name "TestProject"
7. Type "Renamed Project" as the new project name
8. Confirm rename action (press Enter, click outside the field, or click confirm button depending on UI implementation)
9. Verify project name is updated to "Renamed Project"
10. Verify updated name is displayed in the project list
11. Verify name change is persisted
12. Verify no error messages are displayed

### Expected Results
- Project is selected successfully
- Rename action is initiated
- Project name becomes editable
- User can enter new name
- Name is updated successfully
- Updated name is displayed immediately
- Name change is persisted in the system
- No error messages are displayed

### Postconditions
- Project name is changed from "TestProject" to "Renamed Project"
- Updated name is persisted in the system
- Updated name is displayed in the project list
- User remains on Home Screen
- Project functionality remains intact

---

## Test ID: PROJ-RENAME-002
## Test Name: Rename Project - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Rename Project

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- User "user@example.com" has permission to view the project but NOT to rename it
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is on Home Screen
- Project "SharedProject" is visible to "user@example.com" (has view permission)

### Test Data
- Project Name: "SharedProject"
- Attempted New Name: "Unauthorized Rename"

### Test Steps
1. Verify user "user@example.com" is on Home Screen
2. Verify project "SharedProject" is displayed in the project list (if user has view permission)
3. Select project "SharedProject"
4. Attempt to initiate rename action
5. Verify rename action is not available OR rename fails
6. Verify error message "Permission denied" is displayed
7. Verify project name remains "SharedProject"
8. Verify project name is not changed
9. Verify no changes are persisted

### Expected Results
- Project is visible to user (if user has view permission)
- Rename action is not available OR fails when attempted
- Error message "Permission denied" is displayed
- Project name remains unchanged
- No changes are persisted
- User cannot rename projects without proper permissions

### Postconditions
- Project name remains "SharedProject"
- No changes are made to the project
- User remains on Home Screen
- Permission restrictions are enforced

---

## Test ID: PROJ-RENAME-003
## Test Name: Rename Project - Negative Case - Invalid Project Name
## Test Type: Negative
## Related Use Cases: Rename Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to rename the project

### Test Data
- Original Project Name: "TestProject"
- Invalid New Project Name: "" (empty string)

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Select project "TestProject"
4. Initiate rename action
5. Verify project name becomes editable
6. Clear existing name
7. Leave name field empty (or enter only whitespace)
8. Attempt to confirm rename action
9. Verify rename fails OR validation prevents confirmation
10. Verify error message "Invalid project name" is displayed
11. Verify project name remains "TestProject" or reverts to original name
12. Verify name change is not persisted

### Expected Results
- Rename action is initiated
- Empty name is not accepted
- Error message "Invalid project name" is displayed
- Project name remains unchanged or reverts to original
- No changes are persisted
- User can correct the name and try again

### Postconditions
- Project name remains "TestProject"
- No changes are persisted
- User remains on Home Screen
- User can attempt rename again with valid name

---

## Test ID: PROJ-RENAME-004
## Test Name: Rename Project - Negative Case - Duplicate Project Name
## Test Type: Negative
## Related Use Cases: Rename Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- Project "ExistingProject" exists and belongs to the logged-in user
- User has permission to rename both projects

### Test Data
- Original Project Name: "TestProject"
- Attempted New Name: "ExistingProject" (duplicate of existing project name)

### Test Steps
1. Verify user is on Home Screen
2. Verify both projects "TestProject" and "ExistingProject" are displayed in the project list
3. Select project "TestProject"
4. Initiate rename action
5. Verify project name becomes editable
6. Clear existing name "TestProject"
7. Type "ExistingProject" as the new project name
8. Attempt to confirm rename action
9. Verify rename fails OR validation prevents confirmation
10. Verify error message "Invalid project name" or "Project name already exists" is displayed
11. Verify project name remains "TestProject" or reverts to original name
12. Verify name change is not persisted

### Expected Results
- Rename action is initiated
- Duplicate name is not accepted
- Error message is displayed indicating name conflict
- Project name remains unchanged or reverts to original
- No changes are persisted
- User can choose a different name

### Postconditions
- Project name remains "TestProject"
- Project "ExistingProject" remains unchanged
- No changes are persisted
- User remains on Home Screen

---

## Test ID: PROJ-RENAME-005
## Test Name: Rename Project - Cancel Rename Action
## Test Type: Positive (Edge Case)
## Related Use Cases: Rename Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user

### Test Data
- Original Project Name: "TestProject"
- Entered But Not Confirmed Name: "Cancelled Name"

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Select project "TestProject"
4. Initiate rename action
5. Verify project name becomes editable
6. Clear existing name
7. Type "Cancelled Name" as the new project name
8. Cancel rename action (press Escape, click cancel button, or click outside without confirming)
9. Verify rename is cancelled
10. Verify project name reverts to "TestProject"
11. Verify name change is not persisted
12. Verify no error messages are displayed

### Expected Results
- Rename action is initiated
- User can enter new name
- Cancel action works correctly
- Project name reverts to original
- No changes are persisted
- No error messages are displayed

### Postconditions
- Project name remains "TestProject"
- No changes are persisted
- User remains on Home Screen
- User can initiate rename again if needed

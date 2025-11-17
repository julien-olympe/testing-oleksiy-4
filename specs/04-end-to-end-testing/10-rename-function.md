# Rename Function Test Scenarios

## Test ID: FUNC-RENAME-001
## Test Name: Rename Function - Positive Case
## Test Type: Positive
## Related Use Cases: Rename Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- User has permission to rename the function (is project owner or has appropriate permission)

### Test Data
- Original Function Name: "TestFunction"
- New Function Name: "Renamed Function"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Select function "TestFunction" (click on it to select)
4. Initiate rename action (click rename button, right-click menu, or double-click name depending on UI implementation)
5. Verify function name becomes editable (input field appears or name becomes editable inline)
6. Clear existing name "TestFunction"
7. Type "Renamed Function" as the new function name
8. Confirm rename action (press Enter, click outside the field, or click confirm button depending on UI implementation)
9. Verify function name is updated to "Renamed Function"
10. Verify updated name is displayed in the function list
11. Verify name change is persisted
12. Verify no error messages are displayed

### Expected Results
- Function is selected successfully
- Rename action is initiated
- Function name becomes editable
- User can enter new name
- Name is updated successfully
- Updated name is displayed immediately
- Name change is persisted in the system
- No error messages are displayed

### Postconditions
- Function name is changed from "TestFunction" to "Renamed Function"
- Updated name is persisted in the system
- Updated name is displayed in the function list
- User remains in Project Editor
- Function functionality remains intact

---

## Test ID: FUNC-RENAME-002
## Test Name: Rename Function - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Rename Function

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Function "SharedFunction" exists in project "SharedProject"
- User "user@example.com" has permission to view the project but NOT to rename functions
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Project Editor for project "SharedProject"
- Project tab is active in Project Editor

### Test Data
- Function Name: "SharedFunction"
- Attempted New Name: "Unauthorized Rename"
- Project Name: "SharedProject"

### Test Steps
1. Verify user "user@example.com" is in Project Editor with Project tab active
2. Verify function "SharedFunction" is displayed in the function list (if user has view permission)
3. Select function "SharedFunction"
4. Attempt to initiate rename action
5. Verify rename action is not available OR rename fails
6. Verify error message "Permission denied" is displayed
7. Verify function name remains "SharedFunction"
8. Verify function name is not changed
9. Verify no changes are persisted

### Expected Results
- Function is visible to user (if user has view permission)
- Rename action is not available OR fails when attempted
- Error message "Permission denied" is displayed
- Function name remains unchanged
- No changes are persisted
- User cannot rename functions without proper permissions

### Postconditions
- Function name remains "SharedFunction"
- No changes are made to the function
- User remains in Project Editor
- Permission restrictions are enforced

---

## Test ID: FUNC-RENAME-003
## Test Name: Rename Function - Negative Case - Invalid Function Name
## Test Type: Negative
## Related Use Cases: Rename Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- User has permission to rename the function

### Test Data
- Original Function Name: "TestFunction"
- Invalid New Function Name: "" (empty string)
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Select function "TestFunction"
4. Initiate rename action
5. Verify function name becomes editable
6. Clear existing name
7. Leave name field empty (or enter only whitespace)
8. Attempt to confirm rename action
9. Verify rename fails OR validation prevents confirmation
10. Verify error message "Invalid function name" is displayed
11. Verify function name remains "TestFunction" or reverts to original name
12. Verify name change is not persisted

### Expected Results
- Rename action is initiated
- Empty name is not accepted
- Error message "Invalid function name" is displayed
- Function name remains unchanged or reverts to original
- No changes are persisted
- User can correct the name and try again

### Postconditions
- Function name remains "TestFunction"
- No changes are persisted
- User remains in Project Editor
- User can attempt rename again with valid name

---

## Test ID: FUNC-RENAME-004
## Test Name: Rename Function - Negative Case - Duplicate Function Name
## Test Type: Negative
## Related Use Cases: Rename Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- Function "ExistingFunction" exists in project "TestProject"
- User has permission to rename both functions

### Test Data
- Original Function Name: "TestFunction"
- Attempted New Name: "ExistingFunction" (duplicate of existing function name)
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify both functions "TestFunction" and "ExistingFunction" are displayed in the function list
3. Select function "TestFunction"
4. Initiate rename action
5. Verify function name becomes editable
6. Clear existing name "TestFunction"
7. Type "ExistingFunction" as the new function name
8. Attempt to confirm rename action
9. Verify rename fails OR validation prevents confirmation
10. Verify error message "Invalid function name" or "Function name already exists" is displayed
11. Verify function name remains "TestFunction" or reverts to original name
12. Verify name change is not persisted

### Expected Results
- Rename action is initiated
- Duplicate name is not accepted
- Error message is displayed indicating name conflict
- Function name remains unchanged or reverts to original
- No changes are persisted
- User can choose a different name

### Postconditions
- Function name remains "TestFunction"
- Function "ExistingFunction" remains unchanged
- No changes are persisted
- User remains in Project Editor

---

## Test ID: FUNC-RENAME-005
## Test Name: Rename Function - Cancel Rename Action
## Test Type: Positive (Edge Case)
## Related Use Cases: Rename Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"

### Test Data
- Original Function Name: "TestFunction"
- Entered But Not Confirmed Name: "Cancelled Name"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Select function "TestFunction"
4. Initiate rename action
5. Verify function name becomes editable
6. Clear existing name
7. Type "Cancelled Name" as the new function name
8. Cancel rename action (press Escape, click cancel button, or click outside without confirming)
9. Verify rename is cancelled
10. Verify function name reverts to "TestFunction"
11. Verify name change is not persisted
12. Verify no error messages are displayed

### Expected Results
- Rename action is initiated
- User can enter new name
- Cancel action works correctly
- Function name reverts to original
- No changes are persisted
- No error messages are displayed

### Postconditions
- Function name remains "TestFunction"
- No changes are persisted
- User remains in Project Editor
- User can initiate rename again if needed

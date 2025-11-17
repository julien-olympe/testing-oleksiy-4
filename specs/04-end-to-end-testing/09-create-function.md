# Create Function Test Scenarios

## Test ID: FUNC-CREATE-001
## Test Name: Create Function - Positive Case
## Test Type: Positive
## Related Use Cases: Create Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to create functions in the project
- Project tab is active in Project Editor

### Test Data
- Default Function Name: "New Function" (system-generated default name)
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify left side panel is displayed with search bar and brick list
3. Verify "Function" brick is visible in the brick list on the left side
4. Verify center area displays function list (may be empty)
5. Drag "Function" brick from left side brick list
6. Drag the brick over the center function list area
7. Drop "Function" brick in the function list area
8. Verify drop action is detected
9. Verify a new function is created
10. Verify function is created with default name "New Function"
11. Verify function is assigned to the current project "TestProject"
12. Verify function appears in the function list in Project Editor
13. Verify function is displayed immediately after creation
14. Verify function has an empty definition (no bricks configured)
15. Verify no error messages are displayed

### Expected Results
- Project Editor is displayed correctly
- "Function" brick is visible and draggable in the brick list
- Drag and drop action is successful
- New function is created successfully
- Function has default name "New Function"
- Function is assigned to the current project
- Function appears in the function list immediately
- Function has empty definition
- Function is persisted in the system
- No error messages are displayed

### Postconditions
- Function "New Function" exists in project "TestProject"
- Function is displayed in the function list
- Function has empty definition
- User remains in Project Editor
- Function can be opened, renamed, or deleted

---

## Test ID: FUNC-CREATE-002
## Test Name: Create Function - Negative Case - Drag to Invalid Location
## Test Type: Negative
## Related Use Cases: Create Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project tab is active in Project Editor

### Test Data
- No test data required

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify "Function" brick is visible in the brick list
3. Drag "Function" brick from left side brick list
4. Drag the brick to an invalid drop location (e.g., outside function list area, on search bar, on tab header, on settings icon)
5. Release/drop the brick in the invalid location
6. Verify drop is not accepted in invalid location
7. Verify no function is created
8. Verify function list remains unchanged
9. Verify brick returns to original position or drag is cancelled
10. Verify no error messages are displayed (or appropriate feedback is shown)

### Expected Results
- Drag action is initiated
- Drop in invalid location is not accepted
- No function is created
- Function list remains unchanged
- Brick drag is cancelled or brick returns to list
- User receives appropriate feedback (visual or message)

### Postconditions
- No new function is created
- Function list remains unchanged
- User remains in Project Editor
- User can attempt to create function again in valid location

---

## Test ID: FUNC-CREATE-003
## Test Name: Create Function - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Create Function

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- User "user@example.com" has permission to view the project but NOT to create functions
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Project Editor for project "SharedProject"
- Project tab is active in Project Editor

### Test Data
- Project Name: "SharedProject"

### Test Steps
1. Verify user "user@example.com" is in Project Editor with Project tab active
2. Verify "Function" brick is visible in the brick list (if user has view permission)
3. Drag "Function" brick from left side brick list to function list area
4. Drop "Function" brick
5. Verify function creation fails OR function is not created
6. Verify error message "Permission denied" or "Failed to create function" is displayed
7. Verify no function is added to the function list
8. Verify function list remains unchanged

### Expected Results
- Drag and drop action is attempted
- Function creation fails
- Error message is displayed
- No function is created
- Function list remains unchanged
- Permission restrictions are enforced

### Postconditions
- No new function is created
- Function list remains unchanged
- User remains in Project Editor
- Permission restrictions are maintained

---

## Test ID: FUNC-CREATE-004
## Test Name: Create Function - Verify Multiple Functions Can Be Created
## Test Type: Positive
## Related Use Cases: Create Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- At least one function already exists in the project (created in previous test or setup)
- Project tab is active in Project Editor

### Test Data
- Default Function Names: "New Function", "New Function" (system may append numbers for uniqueness)

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify existing function(s) are displayed in function list
3. Count the number of functions in the list
4. Drag "Function" brick from left side brick list to function list area
5. Drop "Function" brick
6. Verify a new function is created
7. Verify new function appears in the function list
8. Verify total number of functions has increased by one
9. Verify all functions are displayed in the list
10. Verify each function has a unique identifier or name
11. Verify no error messages are displayed

### Expected Results
- Multiple functions can be created in the same project
- Each function is created successfully
- All functions are displayed in the function list
- Functions are properly distinguished (by name or identifier)
- No conflicts occur between functions

### Postconditions
- Multiple functions exist in project "TestProject"
- All functions are displayed in the function list
- User remains in Project Editor
- All functions are accessible

---

## Test ID: FUNC-CREATE-005
## Test Name: Create Function - Verify Function Persistence
## Test Type: Positive (Verification)
## Related Use Cases: Create Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- Project tab is active in Project Editor

### Test Data
- Default Function Name: "New Function"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Drag "Function" brick from left side brick list to function list area
3. Drop "Function" brick
4. Verify function "New Function" is created and displayed
5. Navigate away from Project Editor (close editor or navigate to Home Screen)
6. Navigate back to Project Editor (double-click project "TestProject")
7. Verify Project Editor opens
8. Verify Project tab is active
9. Verify function "New Function" is still displayed in the function list
10. Verify function data is persisted in the system

### Expected Results
- Function is created successfully
- After navigation away and back, function still exists
- Function is displayed in the function list after returning
- Function data is persisted in the database/system

### Postconditions
- Function "New Function" exists and is persisted
- Function is displayed after navigation
- User is in Project Editor
- Function is accessible

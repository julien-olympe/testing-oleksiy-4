# Open Function Editor Test Scenarios

## Test ID: FUNC-OPEN-001
## Test Name: Open Function Editor - Positive Case
## Test Type: Positive
## Related Use Cases: Open Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- User has permission to access the function
- Project tab is active in Project Editor

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Double-click on function "TestFunction"
4. Verify Function Editor is opened
5. Verify Function Editor displays settings icon in top-right corner
6. Verify left side panel shows RUN button (positioned above search bar)
7. Verify left side panel shows search bar below RUN button
8. Verify left side panel shows brick list below search bar
9. Verify brick list displays three bricks: "List instances by DB name", "Get first instance", "Log instance props"
10. Verify center area shows grid-based canvas (initially empty if function has no bricks)
11. Verify all bricks in the list are draggable
12. Verify no error messages are displayed

### Expected Results
- Double-click action is recognized
- Function Editor opens successfully
- Function Editor displays all required UI elements
- RUN button is visible above search bar
- Search bar is visible
- Brick list displays all three available bricks
- Center canvas is displayed with grid layout
- All UI elements are properly positioned
- No error messages are displayed

### Postconditions
- Function Editor is open and displayed
- User is in Function Editor view
- User can add bricks, link bricks, set parameters, and run the function
- User can navigate back to Project Editor

---

## Test ID: FUNC-OPEN-002
## Test Name: Open Function Editor - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Open Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Function "PrivateFunction" exists in project "SharedProject"
- User "user@example.com" does NOT have permission to access the function
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Project Editor for project "SharedProject"
- Project tab is active in Project Editor

### Test Data
- Function Name: "PrivateFunction"
- Project Name: "SharedProject"

### Test Steps
1. Verify user "user@example.com" is in Project Editor with Project tab active
2. Verify function "PrivateFunction" is NOT displayed in the function list (if user has no permission) OR function is visible but user lacks access permission
3. If function is visible but user lacks permission, attempt to double-click on function "PrivateFunction"
4. If double-click is attempted, verify access is denied
5. Verify error message "Permission denied" is displayed
6. Verify Function Editor is NOT opened
7. Verify user remains in Project Editor
8. Verify user cannot access the function

### Expected Results
- Function is not visible to unauthorized user OR access is denied
- Error message "Permission denied" is displayed (if access is attempted)
- Function Editor is not opened
- User remains in Project Editor
- Permission restrictions are enforced

### Postconditions
- Function Editor is not opened
- User remains in Project Editor
- User cannot access the function
- Permission restrictions are maintained

---

## Test ID: FUNC-OPEN-003
## Test Name: Open Function Editor - Verify Function Data Loading
## Test Type: Positive (Verification)
## Related Use Cases: Open Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "TestFunction" exists in project "TestProject"
- Function "TestFunction" contains at least one brick configuration (e.g., "List instances by DB name" brick)
- Function "TestFunction" has at least one brick connection configured
- User has permission to access the function
- Project tab is active in Project Editor

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "TestFunction" is displayed in the function list
3. Double-click on function "TestFunction"
4. Verify Function Editor opens
5. Verify center canvas displays the configured bricks
6. Verify bricks are positioned on grid cells
7. Verify brick connections (links) are displayed as connection lines
8. Verify input/output connection points are visible on bricks
9. Verify configured input parameters are displayed on bricks
10. Verify all function data is loaded correctly

### Expected Results
- Function Editor opens successfully
- All function data is loaded
- Bricks are displayed on canvas at correct positions
- Brick connections are displayed as connection lines
- Input/output points are visible
- Configured parameters are displayed
- All data is accurate and up-to-date

### Postconditions
- Function Editor is open
- All function data is loaded and displayed
- User can edit the function
- All bricks and connections are accessible

---

## Test ID: FUNC-OPEN-004
## Test Name: Open Function Editor - Verify Empty Function Display
## Test Type: Positive (Verification)
## Related Use Cases: Open Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Function "EmptyFunction" exists in project "TestProject"
- Function "EmptyFunction" has no bricks configured (empty definition)
- User has permission to access the function
- Project tab is active in Project Editor

### Test Data
- Function Name: "EmptyFunction"
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor with Project tab active
2. Verify function "EmptyFunction" is displayed in the function list
3. Double-click on function "EmptyFunction"
4. Verify Function Editor opens
5. Verify center canvas is displayed
6. Verify canvas is empty (no bricks displayed)
7. Verify grid layout is visible (if grid is always visible)
8. Verify brick list on left side shows available bricks
9. Verify user can add bricks to the empty canvas
10. Verify no error messages are displayed

### Expected Results
- Function Editor opens successfully
- Canvas is displayed correctly
- Canvas is empty (no bricks)
- Grid layout is available for placing bricks
- Brick list is accessible
- User can start adding bricks
- No error messages are displayed

### Postconditions
- Function Editor is open
- Canvas is empty and ready for brick placement
- User can add bricks to create function logic
- All functionality is accessible

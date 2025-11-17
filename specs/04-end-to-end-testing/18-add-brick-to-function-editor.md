# Add Brick to Function Editor Test Scenarios

## Test ID: BRICK-ADD-001
## Test Name: Add Brick to Function Editor - Positive Case
## Test Type: Positive
## Related Use Cases: Add Brick to Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function "TestFunction" exists in project "TestProject"
- Function Editor canvas is displayed (may be empty)
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"
- Brick Type: "List instances by DB name"

### Test Steps
1. Verify user is in Function Editor
2. Verify left side panel shows search bar and brick list
3. Verify brick list displays "List instances by DB name" brick
4. Verify center canvas is displayed with grid layout
5. Drag "List instances by DB name" brick from left side brick list
6. Drag the brick over the center canvas area
7. Drop "List instances by DB name" brick on the canvas
8. Verify drop action is detected
9. Verify brick is added to the canvas
10. Verify brick is positioned on a grid cell
11. Verify brick displays input connection point "Name of DB" (as a larger dot)
12. Verify brick displays output connection point "List" (as a larger dot)
13. Verify brick is displayed with its label/name
14. Verify brick configuration is automatically persisted
15. Verify no error messages are displayed

### Expected Results
- Brick list is displayed correctly
- Brick is draggable
- Drag and drop action is successful
- Brick is added to canvas at grid position
- Brick displays input and output connection points
- Connection points are visible as larger dots
- Brick is positioned on grid cell
- Brick configuration is persisted automatically
- No error messages are displayed

### Postconditions
- "List instances by DB name" brick exists on function canvas
- Brick is positioned on grid cell
- Brick is persisted in function definition
- User remains in Function Editor
- Brick can be linked, configured, or removed

---

## Test ID: BRICK-ADD-002
## Test Name: Add Brick to Function Editor - Add All Available Bricks
## Test Type: Positive
## Related Use Cases: Add Brick to Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function "TestFunction" exists in project "TestProject"
- Function Editor canvas is displayed (empty)
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"
- Brick Types: "List instances by DB name", "Get first instance", "Log instance props"

### Test Steps
1. Verify user is in Function Editor
2. Verify brick list displays three bricks: "List instances by DB name", "Get first instance", "Log instance props"
3. Drag "List instances by DB name" brick to canvas and drop
4. Verify brick is added to canvas
5. Drag "Get first instance" brick to canvas and drop
6. Verify brick is added to canvas at different grid position
7. Drag "Log instance props" brick to canvas and drop
8. Verify brick is added to canvas at different grid position
9. Verify all three bricks are displayed on canvas
10. Verify each brick is at a different grid position
11. Verify all bricks display their respective input and output connection points
12. Verify all brick configurations are persisted
13. Verify no error messages are displayed

### Expected Results
- All three bricks can be added to canvas
- Each brick is added successfully
- Bricks are positioned at different grid cells
- All bricks display connection points correctly
- All bricks are persisted
- No conflicts occur between bricks

### Postconditions
- All three bricks exist on function canvas
- Bricks are positioned on different grid cells
- All bricks are persisted in function definition
- User remains in Function Editor
- All bricks are accessible for linking and configuration

---

## Test ID: BRICK-ADD-003
## Test Name: Add Brick to Function Editor - Negative Case - Drag to Invalid Location
## Test Type: Negative
## Related Use Cases: Add Brick to Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function Editor canvas is displayed
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Brick Type: "List instances by DB name"

### Test Steps
1. Verify user is in Function Editor
2. Verify "List instances by DB name" brick is visible in brick list
3. Drag "List instances by DB name" brick from brick list
4. Drag the brick to an invalid drop location (e.g., outside canvas area, on search bar, on RUN button, on settings icon)
5. Release/drop the brick in the invalid location
6. Verify drop is not accepted in invalid location
7. Verify no brick is added to canvas
8. Verify brick returns to original position or drag is cancelled
9. Verify canvas remains unchanged
10. Verify no error messages are displayed (or appropriate feedback is shown)

### Expected Results
- Drag action is initiated
- Drop in invalid location is not accepted
- No brick is added to canvas
- Canvas remains unchanged
- Brick drag is cancelled or brick returns to list
- User receives appropriate feedback (visual or message)

### Postconditions
- No brick is added to canvas
- Canvas remains unchanged
- User remains in Function Editor
- User can attempt to add brick again in valid location

---

## Test ID: BRICK-ADD-004
## Test Name: Add Brick to Function Editor - Negative Case - Invalid Brick Type
## Test Type: Negative
## Related Use Cases: Add Brick to Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function Editor canvas is displayed
- User has permission to edit the function
- System only allows specific brick types in Function Editor

### Test Data
- Function Name: "TestFunction"
- Invalid Brick: Brick type that is not allowed in Function Editor (if such exists)

### Test Steps
1. Verify user is in Function Editor
2. Verify only valid bricks are displayed in brick list
3. If invalid brick type somehow appears or is attempted, verify it cannot be added
4. Verify error message "Invalid brick type" is displayed (if invalid brick is attempted)
5. Verify no invalid brick is added to canvas
6. Verify canvas remains unchanged

### Expected Results
- Only valid bricks are available in brick list
- Invalid bricks cannot be added
- Error message is displayed (if invalid brick is attempted)
- Canvas remains unchanged
- System enforces valid brick types

### Postconditions
- No invalid brick is added to canvas
- Canvas remains unchanged
- User remains in Function Editor
- Only valid bricks are accessible

---

## Test ID: BRICK-ADD-005
## Test Name: Add Brick to Function Editor - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Add Brick to Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Function "SharedFunction" exists in project "SharedProject"
- User "user@example.com" has permission to view the function but NOT to edit it
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Function Editor for function "SharedFunction"

### Test Data
- Function Name: "SharedFunction"
- Project Name: "SharedProject"
- Brick Type: "List instances by DB name"

### Test Steps
1. Verify user "user@example.com" is in Function Editor
2. Verify brick list is displayed (if user has view permission)
3. Attempt to drag "List instances by DB name" brick to canvas
4. Verify drag and drop fails OR brick cannot be added
5. Verify error message "Permission denied" is displayed
6. Verify no brick is added to canvas
7. Verify canvas remains unchanged

### Expected Results
- Brick list is visible (if user has view permission)
- Drag and drop action fails
- Error message "Permission denied" is displayed
- No brick is added to canvas
- Permission restrictions are enforced

### Postconditions
- No brick is added to canvas
- Canvas remains unchanged
- User "user@example.com" remains in Function Editor
- Permission restrictions are maintained

---

## Test ID: BRICK-ADD-006
## Test Name: Add Brick to Function Editor - Verify Brick Persistence
## Test Type: Positive (Verification)
## Related Use Cases: Add Brick to Function Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function Editor canvas is displayed (empty)
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Brick Type: "List instances by DB name"

### Test Steps
1. Verify user is in Function Editor
2. Verify canvas is empty
3. Drag "List instances by DB name" brick to canvas and drop
4. Verify brick is added to canvas
5. Navigate away from Function Editor (close editor or navigate to Project Editor)
6. Navigate back to Function Editor (double-click function "TestFunction")
7. Verify Function Editor opens
8. Verify "List instances by DB name" brick is still displayed on canvas
9. Verify brick is at the same grid position
10. Verify brick configuration is persisted

### Expected Results
- Brick is added successfully
- After navigation away and back, brick still exists
- Brick is displayed at same position
- Brick configuration is persisted in the system

### Postconditions
- Brick exists and is persisted
- Brick is displayed after navigation
- User is in Function Editor
- Brick is accessible

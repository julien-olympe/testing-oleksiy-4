# Link Bricks Test Scenarios

## Test ID: BRICK-LINK-001
## Test Name: Link Bricks - Positive Case
## Test Type: Positive
## Related Use Cases: Link Bricks

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function "TestFunction" exists in project "TestProject"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- Both bricks are positioned on different grid cells
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Source Brick: "List instances by DB name"
- Source Output: "List"
- Target Brick: "Get first instance"
- Target Input: "List"

### Test Steps
1. Verify user is in Function Editor
2. Verify both bricks are displayed on canvas
3. Verify "List instances by DB name" brick displays output connection point "List" (as a larger dot)
4. Verify "Get first instance" brick displays input connection point "List" (as a larger dot)
5. Click and drag from the output connection point "List" of "List instances by DB name" brick
6. Drag the connection line toward the input connection point "List" of "Get first instance" brick
7. Release/drop the connection line on the input connection point "List" of "Get first instance" brick
8. Verify link is created successfully
9. Verify a connection line is displayed connecting the two connection points
10. Verify connection line is visible and properly rendered
11. Verify link configuration is automatically persisted
12. Verify no error messages are displayed

### Expected Results
- Connection points are visible and clickable
- Drag action from output to input is successful
- Link is created between compatible connection points
- Connection line is displayed visually
- Connection line shows data flow direction
- Link is persisted automatically
- No error messages are displayed

### Postconditions
- Link exists between "List instances by DB name" output "List" and "Get first instance" input "List"
- Connection line is visible on canvas
- Link is persisted in function definition
- User remains in Function Editor
- Link can be removed or modified

---

## Test ID: BRICK-LINK-002
## Test Name: Link Bricks - Link Complete Chain
## Test Type: Positive
## Related Use Cases: Link Bricks

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- "Log instance props" brick exists on canvas
- All bricks are positioned on different grid cells
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Brick 1: "List instances by DB name"
- Brick 2: "Get first instance"
- Brick 3: "Log instance props"

### Test Steps
1. Verify user is in Function Editor
2. Verify all three bricks are displayed on canvas
3. Create link from "List instances by DB name" output "List" to "Get first instance" input "List"
4. Verify first link is created and displayed
5. Create link from "Get first instance" output "DB" to "Log instance props" input "Object"
6. Verify second link is created and displayed
7. Verify both connection lines are visible
8. Verify complete chain is linked: "List instances by DB name" → "Get first instance" → "Log instance props"
9. Verify all links are persisted
10. Verify no error messages are displayed

### Expected Results
- First link is created successfully
- Second link is created successfully
- Both connection lines are visible
- Complete chain is linked correctly
- All links are persisted
- No error messages are displayed

### Postconditions
- Complete chain of links exists
- All connection lines are visible
- All links are persisted in function definition
- User remains in Function Editor
- Function logic flow is established

---

## Test ID: BRICK-LINK-003
## Test Name: Link Bricks - Negative Case - Incompatible Types
## Test Type: Negative
## Related Use Cases: Link Bricks

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Log instance props" brick exists on canvas
- Both bricks are positioned on different grid cells
- User has permission to edit the function
- System validates type compatibility between connection points

### Test Data
- Function Name: "TestFunction"
- Source Brick: "List instances by DB name"
- Source Output: "List"
- Target Brick: "Log instance props"
- Target Input: "Object" (incompatible with "List" output type)

### Test Steps
1. Verify user is in Function Editor
2. Verify both bricks are displayed on canvas
3. Attempt to create link from "List instances by DB name" output "List" to "Log instance props" input "Object"
4. Verify link creation fails OR system prevents incompatible link
5. Verify error message "Incompatible types" is displayed
6. Verify no link is created
7. Verify no connection line is displayed
8. Verify canvas remains unchanged

### Expected Results
- Link creation is attempted
- System validates type compatibility
- Incompatible link is rejected
- Error message "Incompatible types" is displayed
- No link is created
- Canvas remains unchanged

### Postconditions
- No link is created
- Canvas remains unchanged
- User remains in Function Editor
- User can create compatible links

---

## Test ID: BRICK-LINK-004
## Test Name: Link Bricks - Negative Case - Link Already Exists
## Test Type: Negative
## Related Use Cases: Link Bricks

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- Link already exists from "List instances by DB name" output "List" to "Get first instance" input "List"
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Source Brick: "List instances by DB name"
- Source Output: "List"
- Target Brick: "Get first instance"
- Target Input: "List"

### Test Steps
1. Verify user is in Function Editor
2. Verify both bricks are displayed on canvas
3. Verify existing link is displayed as connection line
4. Attempt to create another link from "List instances by DB name" output "List" to "Get first instance" input "List"
5. Verify link creation fails OR system prevents duplicate link
6. Verify error message "Link already exists" is displayed
7. Verify no duplicate link is created
8. Verify only one connection line exists
9. Verify canvas remains unchanged

### Expected Results
- Existing link is visible
- Duplicate link creation is attempted
- System prevents duplicate links
- Error message "Link already exists" is displayed
- No duplicate link is created
- Only one connection line exists

### Postconditions
- Only one link exists between the connection points
- No duplicate link is created
- User remains in Function Editor
- Canvas remains unchanged

---

## Test ID: BRICK-LINK-005
## Test Name: Link Bricks - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Link Bricks

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Function "SharedFunction" exists in project "SharedProject"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- User "user@example.com" has permission to view the function but NOT to edit it
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Function Editor for function "SharedFunction"

### Test Data
- Function Name: "SharedFunction"
- Project Name: "SharedProject"

### Test Steps
1. Verify user "user@example.com" is in Function Editor
2. Verify bricks are displayed on canvas (if user has view permission)
3. Attempt to create link between bricks
4. Verify link creation fails OR linking is disabled
5. Verify error message "Permission denied" is displayed
6. Verify no link is created
7. Verify canvas remains unchanged

### Expected Results
- Bricks are visible (if user has view permission)
- Link creation fails
- Error message "Permission denied" is displayed
- No link is created
- Permission restrictions are enforced

### Postconditions
- No link is created
- Canvas remains unchanged
- User "user@example.com" remains in Function Editor
- Permission restrictions are maintained

---

## Test ID: BRICK-LINK-006
## Test Name: Link Bricks - Verify Link Persistence
## Test Type: Positive (Verification)
## Related Use Cases: Link Bricks

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"

### Test Steps
1. Verify user is in Function Editor
2. Verify both bricks are displayed on canvas
3. Create link from "List instances by DB name" output "List" to "Get first instance" input "List"
4. Verify link is created and connection line is displayed
5. Navigate away from Function Editor (close editor or navigate to Project Editor)
6. Navigate back to Function Editor (double-click function "TestFunction")
7. Verify Function Editor opens
8. Verify both bricks are still displayed on canvas
9. Verify connection line is still displayed between the bricks
10. Verify link is persisted in function definition

### Expected Results
- Link is created successfully
- After navigation away and back, link still exists
- Connection line is displayed after returning
- Link is persisted in the system

### Postconditions
- Link exists and is persisted
- Connection line is displayed after navigation
- User is in Function Editor
- Link is accessible

# Critical Path Test Scenario

## Test ID: CP-001
## Test Name: Complete Happy Path - User Registration to Function Execution
## Test Type: Critical Path (Happy Path Only)
## Related Use Cases: Register, Login, Create Project, Rename Project, Open Project Editor, Add Project Permission, Create Database Instance, Edit Database Instance Property, Create Function, Open Function Editor, Add Brick to Function Editor, Set Brick Input Parameter, Link Bricks, Run Function

### Preconditions
- Application is accessible and running
- No user account exists with email "testuser@example.com"
- No user account exists with email "testuser2@example.com"
- Browser console is open and visible for log output verification
- "default database" type exists in the system with a string property

### Test Data
- Primary User Email: "testuser@example.com"
- Primary User Password: "SecurePass123!"
- Secondary User Email: "testuser2@example.com"
- Secondary User Password: "SecurePass456!"
- Project Name (Initial): "New Project" (default name)
- Project Name (Renamed): "My Test Project"
- Database Instance String Value 1: "First Instance Value"
- Database Instance String Value 2: "Second Instance Value"
- Function Name (Initial): "New Function" (default name)

### Test Steps

#### Step 1: Register Primary User
1. Navigate to Login Screen
2. Verify Login Screen is displayed with email input field, password input field, Login button, and Register button
3. Click Register button
4. Verify registration form is displayed
5. Enter "testuser@example.com" in email input field
6. Enter "SecurePass123!" in password input field
7. Complete any additional required registration fields (if any)
8. Submit registration form
9. Verify user is automatically logged in
10. Verify user is redirected to Home Screen
11. Verify Home Screen displays empty project list (no projects yet)

#### Step 2: Register Secondary User
1. Click settings icon (round icon) in top-right corner
2. Verify settings menu is displayed showing user name and logout option
3. Click logout option
4. Verify user is redirected to Login Screen
5. Click Register button
6. Enter "testuser2@example.com" in email input field
7. Enter "SecurePass456!" in password input field
8. Complete any additional required registration fields (if any)
9. Submit registration form
10. Verify user is automatically logged in
11. Verify user is redirected to Home Screen

#### Step 3: Login Primary User
1. Click settings icon in top-right corner
2. Click logout option
3. Verify user is redirected to Login Screen
4. Enter "testuser@example.com" in email input field
5. Enter "SecurePass123!" in password input field
6. Click Login button
7. Verify user is authenticated
8. Verify user is redirected to Home Screen
9. Verify Home Screen displays empty project list

#### Step 4: Create Project
1. Verify Home Screen is displayed
2. Verify left side panel shows search bar and brick list
3. Verify "Project" brick is visible in the brick list
4. Drag "Project" brick from left side panel to the center project list area
5. Drop "Project" brick in the project list area
6. Verify a new project is created with default name "New Project"
7. Verify the project appears in the project list on Home Screen
8. Verify the project is assigned to the logged-in user

#### Step 5: Rename Project
1. Verify project "New Project" is displayed in the project list
2. Select the project "New Project" (click on it)
3. Initiate rename action (click rename button or double-click name, depending on UI implementation)
4. Verify project name becomes editable
5. Clear existing name
6. Type "My Test Project" as the new project name
7. Confirm rename (press Enter or click outside the field, depending on UI implementation)
8. Verify project name is updated to "My Test Project" in the project list
9. Verify project name change is persisted

#### Step 6: Open Project Editor
1. Verify project "My Test Project" is displayed in the project list
2. Double-click on project "My Test Project"
3. Verify Project Editor is opened
4. Verify Project Editor displays header with tabs: Project, Permissions, Database
5. Verify Project tab is active by default
6. Verify left side panel shows search bar and brick list with "Function" brick visible
7. Verify center area shows function list (initially empty)

#### Step 7: Add Project Permission
1. Verify Project Editor is displayed with Project tab active
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify left side panel brick list is hidden
5. Verify center area displays user list showing current user (testuser@example.com)
6. Verify "Add a user" button is displayed
7. Click "Add a user" button
8. Verify add user interface is displayed with email input field
9. Enter "testuser2@example.com" in the email input field
10. Click confirmation button (or press Enter, depending on UI implementation)
11. Verify "testuser2@example.com" is added to the user list
12. Verify permission is persisted
13. Verify no error messages are displayed

#### Step 8: Create Database Instances
1. Verify Project Editor is displayed
2. Click Database tab in the header
3. Verify Database tab is now active
4. Verify left side displays database type list showing "default database"
5. Verify right side displays database instances list (initially empty)
6. Verify "Create instance" button is displayed
7. Click "Create instance" button
8. Verify a new database instance is created and added to the instances list
9. Verify the instance displays an input field for the string property
10. Click on the string property input field for the first instance
11. Type "First Instance Value" in the input field
12. Verify the value is automatically saved (no save button click required)
13. Click "Create instance" button again
14. Verify a second database instance is created and added to the instances list
15. Click on the string property input field for the second instance
16. Type "Second Instance Value" in the input field
17. Verify the value is automatically saved
18. Verify both instances are persisted with their respective string values

#### Step 9: Create Function
1. Verify Project Editor is displayed
2. Click Project tab in the header
3. Verify Project tab is now active
4. Verify left side panel shows search bar and brick list with "Function" brick visible
5. Verify center area shows function list (initially empty)
6. Drag "Function" brick from left side panel to the center function list area
7. Drop "Function" brick in the function list area
8. Verify a new function is created with default name "New Function"
9. Verify the function appears in the function list in Project Editor
10. Verify the function is assigned to the current project

#### Step 10: Open Function Editor
1. Verify function "New Function" is displayed in the function list
2. Double-click on function "New Function"
3. Verify Function Editor is opened
4. Verify Function Editor displays settings icon in top-right corner
5. Verify left side panel shows RUN button (above search bar), search bar, and brick list
6. Verify brick list displays three bricks: "List instances by DB name", "Get first instance", "Log instance props"
7. Verify center area shows grid-based canvas (initially empty)

#### Step 11: Add Bricks to Function Editor
1. Verify Function Editor is displayed with empty canvas
2. Drag "List instances by DB name" brick from left side brick list to the center canvas
3. Drop the brick on the canvas
4. Verify "List instances by DB name" brick appears on the canvas at a grid cell position
5. Verify the brick displays input connection point labeled "Name of DB" (as a larger dot)
6. Verify the brick displays output connection point labeled "List" (as a larger dot)
7. Drag "Get first instance" brick from left side brick list to the center canvas
8. Drop the brick on the canvas
9. Verify "Get first instance" brick appears on the canvas at a different grid cell position
10. Verify the brick displays input connection point labeled "List" (as a larger dot)
11. Verify the brick displays output connection point labeled "DB" (as a larger dot)
12. Drag "Log instance props" brick from left side brick list to the center canvas
13. Drop the brick on the canvas
14. Verify "Log instance props" brick appears on the canvas at a different grid cell position
15. Verify the brick displays input connection point labeled "Object" (as a larger dot)
16. Verify the brick displays output connection point labeled "value" (as a larger dot)
17. Verify all three bricks are persisted on the canvas

#### Step 12: Set Brick Input Parameter
1. Verify "List instances by DB name" brick is displayed on the canvas
2. Click on the input parameter "Name of DB" on the "List instances by DB name" brick
3. Verify a dropdown or selection interface is displayed showing available databases
4. Verify "default database" is listed in the available databases
5. Select "default database" from the list
6. Verify "default database" is set as the value for the "Name of DB" input parameter
7. Verify the parameter value is displayed on the brick
8. Verify the parameter configuration is automatically persisted

#### Step 13: Link Bricks
1. Verify all three bricks are displayed on the canvas with their connection points visible
2. Drag from the output connection point "List" of "List instances by DB name" brick
3. Drag the connection line to the input connection point "List" of "Get first instance" brick
4. Release to create the link
5. Verify a connection line is displayed connecting the "List" output of "List instances by DB name" to the "List" input of "Get first instance"
6. Drag from the output connection point "DB" of "Get first instance" brick
7. Drag the connection line to the input connection point "Object" of "Log instance props" brick
8. Release to create the link
9. Verify a connection line is displayed connecting the "DB" output of "Get first instance" to the "Object" input of "Log instance props"
10. Verify both connection lines are visible and properly rendered
11. Verify all brick connections are automatically persisted

#### Step 14: Run Function
1. Verify Function Editor is displayed with all three bricks connected
2. Verify "List instances by DB name" brick has "default database" set as input parameter
3. Verify connection line exists from "List instances by DB name" output "List" to "Get first instance" input "List"
4. Verify connection line exists from "Get first instance" output "DB" to "Log instance props" input "Object"
5. Verify RUN button is visible above the search bar in the left side panel
6. Click RUN button
7. Verify function execution starts (no error messages displayed)
8. Verify function logic executes in the correct order:
   - "List instances by DB name" retrieves all instances of "default database"
   - "Get first instance" extracts the first instance from the list
   - "Log instance props" outputs the instance properties to console
9. Verify browser console displays the logged instance properties
10. Verify console output shows the first instance's string property value ("First Instance Value")
11. Verify console output shows the object structure with all properties
12. Verify no execution errors are displayed
13. Verify function execution completes successfully

### Expected Results Summary
- Primary user successfully registers and is automatically logged in
- Secondary user successfully registers and is automatically logged in
- Primary user successfully logs in
- Project is created with default name and appears in project list
- Project is renamed successfully and change is persisted
- Project Editor opens successfully with all tabs accessible
- Secondary user is successfully added to project permissions
- Two database instances are created with string values and auto-saved
- Function is created and appears in function list
- Function Editor opens successfully with empty canvas
- All three bricks are added to canvas and displayed correctly
- "default database" is set as input parameter on "List instances by DB name" brick
- All bricks are properly linked with visible connection lines
- Function executes successfully and logs first instance properties to console
- Console output shows correct instance data ("First Instance Value")

### Postconditions
- Primary user account exists with email "testuser@example.com"
- Secondary user account exists with email "testuser2@example.com"
- Project "My Test Project" exists and belongs to primary user
- Secondary user has permission to access "My Test Project"
- Two database instances exist for "default database" with values "First Instance Value" and "Second Instance Value"
- Function "New Function" exists in "My Test Project"
- Function contains three connected bricks with proper configuration
- All changes are persisted in the system
- User remains in Function Editor after execution
- Browser console contains logged output from function execution

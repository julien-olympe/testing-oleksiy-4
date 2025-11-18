# Critical Path Test: Complete Happy Path Scenario

## Test Name
Complete User Journey: Registration → Login → Project Creation → Function Execution

## Description
This test covers the complete happy path scenario from user registration through function execution. It validates the entire workflow: user registers, logs in, creates a project, renames the project, enters the project, adds another registered user, creates database instances with string values, adds a Function, enters the function, adds three bricks ("List instances by DB", "Get first instance", "Log instance props"), sets "default database" on "List instances by DB" input, links the three bricks, clicks RUN, and sees the content of the first instance in console.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible and empty (or test data will be cleaned up)
3. No existing user with email `test-user-${timestamp}@example.com` exists
4. No existing user with email `test-user-collaborator-${timestamp}@example.com` exists
5. Browser automation environment is set up with Playwright

## Test Steps

### Phase 1: User Registration

**Step 1.1: Navigate to Login Screen**
- Action: Open browser and navigate to base URL
- Expected State: Login Screen is displayed
- Assertions:
  - Verify URL contains `/login` or is root URL showing login form
  - Verify login form is visible (email input, password input, Login button)
  - Verify registration form is visible (email input, password input, Register button)

**Step 1.2: Register First User**
- Action: Fill registration form with:
  - Email: `test-user-${timestamp}@example.com` (where timestamp is current timestamp)
  - Password: `TestPassword123!`
- Expected State: Form fields are filled with entered values
- Assertions:
  - Verify email input contains entered email
  - Verify password input is masked (type="password")

**Step 1.3: Submit Registration**
- Action: Click the "Register" button
- Expected State: Registration is processed
- Assertions:
  - Wait for navigation or success message
  - Verify success message is displayed: "Registration successful" or similar
  - Verify user remains on Login Screen (or is redirected to Login Screen)

**Step 1.4: Register Second User (Collaborator)**
- Action: Fill registration form with:
  - Email: `test-user-collaborator-${timestamp}@example.com`
  - Password: `TestPassword123!`
- Expected State: Form fields are filled
- Assertions:
  - Verify email input contains entered email

**Step 1.5: Submit Second Registration**
- Action: Click the "Register" button
- Expected State: Registration is processed
- Assertions:
  - Verify success message is displayed
  - Verify user remains on Login Screen

### Phase 2: User Login

**Step 2.1: Fill Login Form**
- Action: Fill login form with first user credentials:
  - Email: `test-user-${timestamp}@example.com`
  - Password: `TestPassword123!`
- Expected State: Form fields are filled
- Assertions:
  - Verify email input contains entered email
  - Verify password input is masked

**Step 2.2: Submit Login**
- Action: Click the "Login" button
- Expected State: Login is processed and user is authenticated
- Assertions:
  - Wait for navigation to Home Screen
  - Verify URL changes to Home Screen URL (contains `/home` or root shows projects)
  - Verify Home Screen is displayed (project list area is visible)

**Step 2.3: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with all components
- Assertions:
  - Verify settings icon (round icon) is visible in top-right corner
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side showing "Project" brick
  - Verify project list area is visible in center/right side
  - Verify project list is empty (no projects yet) or shows "No projects" message

### Phase 3: Project Creation

**Step 3.1: Locate Project Brick**
- Action: Verify "Project" brick is visible in brick list on left side
- Expected State: "Project" brick is displayed in brick list
- Assertions:
  - Verify "Project" brick is visible in brick list
  - Verify brick list is scrollable if needed

**Step 3.2: Drag Project Brick**
- Action: Drag "Project" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts (visual feedback may be present)

**Step 3.3: Drop Project Brick in Project List Area**
- Action: Drop "Project" brick in the project list area (center/right side)
- Expected State: Project is created
- Assertions:
  - Wait for new project to appear in project list
  - Verify new project appears in project list with default name (e.g., "New Project" or "Project 1")
  - Verify project is visible and clickable

### Phase 4: Rename Project

**Step 4.1: Select Project for Rename**
- Action: Right-click on the newly created project or click to select it
- Expected State: Project is selected
- Assertions:
  - Verify project is selected (visual indication may be present)

**Step 4.2: Access Rename Interface**
- Action: Access rename option (context menu or inline editing)
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible or context menu shows "Rename" option
  - If context menu: Click "Rename" option
  - Verify rename input field becomes editable

**Step 4.3: Enter New Project Name**
- Action: Enter new project name: `My Test Project`
- Expected State: Project name field contains new name
- Assertions:
  - Verify input field contains "My Test Project"

**Step 4.4: Confirm Rename**
- Action: Confirm rename (press Enter or click confirm button)
- Expected State: Project name is updated
- Assertions:
  - Wait for project name to update
  - Verify project list shows project with name "My Test Project"
  - Verify rename interface is closed

### Phase 5: Enter Project Editor

**Step 5.1: Open Project Editor**
- Action: Double-click on project "My Test Project"
- Expected State: Project Editor screen is displayed
- Assertions:
  - Wait for navigation to Project Editor
  - Verify URL changes to Project Editor URL (contains `/projects/{projectId}` or similar)
  - Verify Project Editor screen is displayed

**Step 5.2: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load
- Expected State: Project Editor displays with all components
- Assertions:
  - Verify settings icon is visible in top-right corner
  - Verify tab bar is visible with three tabs: "Project", "Permissions", "Database"
  - Verify "Project" tab is active by default
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side showing "Function" brick
  - Verify function list area is visible in central area (may be empty)

### Phase 6: Add User to Project Permissions

**Step 6.1: Navigate to Permissions Tab**
- Action: Click on "Permissions" tab in the tab bar
- Expected State: Permissions tab is displayed
- Assertions:
  - Verify "Permissions" tab becomes active
  - Verify Permissions tab content is displayed
  - Verify user list is visible showing project owner (current user)
  - Verify "Add user" button is visible

**Step 6.2: Click Add User Button**
- Action: Click "Add user" button
- Expected State: Add user interface is displayed
- Assertions:
  - Verify add user interface is displayed (modal, form, or inline form)
  - Verify email input field is visible
  - Verify "Add" or "Confirm" button is visible
  - Verify "Cancel" button is visible (if applicable)

**Step 6.3: Enter Collaborator Email**
- Action: Enter email address: `test-user-collaborator-${timestamp}@example.com`
- Expected State: Email input contains entered email
- Assertions:
  - Verify email input field contains the collaborator email

**Step 6.4: Submit Add User**
- Action: Click "Add" or "Confirm" button
- Expected State: User is added to permissions list
- Assertions:
  - Wait for user to appear in permissions list
  - Verify collaborator user appears in user list
  - Verify user list shows both project owner and collaborator
  - Verify add user interface is closed

### Phase 7: Create Database Instances

**Step 7.1: Navigate to Database Tab**
- Action: Click on "Database" tab in the tab bar
- Expected State: Database tab is displayed
- Assertions:
  - Verify "Database" tab becomes active
  - Verify Database tab content is displayed
  - Verify database list is visible on left side showing "default database"
  - Verify instance list is visible on right side (may be empty)
  - Verify "Create instance" button is visible

**Step 7.2: Select Default Database**
- Action: Click on "default database" in the database list
- Expected State: Default database is selected
- Assertions:
  - Verify "default database" is selected (visual indication may be present)
  - Verify instance list area is ready for instance creation

**Step 7.3: Click Create Instance Button**
- Action: Click "Create instance" button
- Expected State: Create instance interface is displayed
- Assertions:
  - Verify create instance interface is displayed (modal, form, or inline form)
  - Verify string property input field is visible
  - Verify "Create" or "Confirm" button is visible
  - Verify "Cancel" button is visible (if applicable)

**Step 7.4: Enter First String Value**
- Action: Enter string value: `First Instance Value`
- Expected State: String input contains entered value
- Assertions:
  - Verify string input field contains "First Instance Value"

**Step 7.5: Create First Instance**
- Action: Click "Create" or "Confirm" button
- Expected State: First instance is created
- Assertions:
  - Wait for instance to appear in instance list
  - Verify new instance appears in instance list on right side
  - Verify instance displays string property value "First Instance Value"
  - Verify create instance interface is closed

**Step 7.6: Create Second Instance**
- Action: Repeat steps 7.3-7.5 with string value: `Second Instance Value`
- Expected State: Second instance is created
- Assertions:
  - Verify second instance appears in instance list
  - Verify instance list shows both instances
  - Verify second instance displays string property value "Second Instance Value"

**Step 7.7: Create Third Instance (Optional)**
- Action: Repeat steps 7.3-7.5 with string value: `Third Instance Value`
- Expected State: Third instance is created
- Assertions:
  - Verify third instance appears in instance list
  - Verify instance list shows all three instances

### Phase 8: Create Function

**Step 8.1: Navigate to Project Tab**
- Action: Click on "Project" tab in the tab bar
- Expected State: Project tab is displayed
- Assertions:
  - Verify "Project" tab becomes active
  - Verify function list area is visible
  - Verify "Function" brick is visible in brick list on left side

**Step 8.2: Drag Function Brick**
- Action: Drag "Function" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts

**Step 8.3: Drop Function Brick in Function List Area**
- Action: Drop "Function" brick in the function list area (central area of Project tab)
- Expected State: Function is created
- Assertions:
  - Wait for new function to appear in function list
  - Verify new function appears in function list with default name (e.g., "New Function" or "Function 1")
  - Verify function is visible and double-clickable

### Phase 9: Enter Function Editor

**Step 9.1: Open Function Editor**
- Action: Double-click on the newly created function
- Expected State: Function Editor screen is displayed
- Assertions:
  - Wait for navigation to Function Editor
  - Verify URL changes to Function Editor URL (contains `/functions/{functionId}` or similar)
  - Verify Function Editor screen is displayed

**Step 9.2: Verify Function Editor Display**
- Action: Wait for Function Editor to fully load
- Expected State: Function Editor displays with all components
- Assertions:
  - Verify settings icon is visible in top-right corner
  - Verify RUN button is visible above search bar on left side
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side showing three bricks:
    - "List instances by DB name"
    - "Get first instance"
    - "Log instance props"
  - Verify central grid panel is visible and empty (no bricks yet)

### Phase 10: Add Bricks to Function

**Step 10.1: Add "List instances by DB name" Brick**
- Action: Drag "List instances by DB name" brick from brick list and drop it in the central grid panel
- Expected State: Brick is added to grid
- Assertions:
  - Wait for brick to appear in grid panel
  - Verify "List instances by DB name" brick is visible in grid panel
  - Verify brick displays input "Name of DB" and output "List"
  - Verify brick is positioned in a grid cell

**Step 10.2: Add "Get first instance" Brick**
- Action: Drag "Get first instance" brick from brick list and drop it in the central grid panel (different grid cell)
- Expected State: Second brick is added to grid
- Assertions:
  - Wait for brick to appear in grid panel
  - Verify "Get first instance" brick is visible in grid panel
  - Verify brick displays input "List" and output "DB"
  - Verify both bricks are visible in grid panel

**Step 10.3: Add "Log instance props" Brick**
- Action: Drag "Log instance props" brick from brick list and drop it in the central grid panel (different grid cell)
- Expected State: Third brick is added to grid
- Assertions:
  - Wait for brick to appear in grid panel
  - Verify "Log instance props" brick is visible in grid panel
  - Verify brick displays input "Object" and output "value"
  - Verify all three bricks are visible in grid panel

### Phase 11: Configure Brick Input

**Step 11.1: Click on "Name of DB" Input**
- Action: Click on the "Name of DB" input of the "List instances by DB name" brick
- Expected State: Database selection dropdown is displayed
- Assertions:
  - Wait for dropdown to appear
  - Verify dropdown list is visible
  - Verify dropdown shows available databases (should include "default database")

**Step 11.2: Select "default database"**
- Action: Select "default database" from the dropdown list
- Expected State: Database is selected and input is configured
- Assertions:
  - Wait for selection to be applied
  - Verify "Name of DB" input displays "default database" or shows selected value
  - Verify dropdown is closed
  - Verify input appears configured (visual indication may be present)

### Phase 12: Connect Bricks

**Step 12.1: Connect "List instances by DB name" to "Get first instance"**
- Action: Click and drag from the "List" output port of "List instances by DB name" brick to the "List" input port of "Get first instance" brick
- Expected State: Connection line is created
- Assertions:
  - Wait for connection line to appear
  - Verify connection line is visible between "List" output and "List" input
  - Verify connection line is properly rendered

**Step 12.2: Connect "Get first instance" to "Log instance props"**
- Action: Click and drag from the "DB" output port of "Get first instance" brick to the "Object" input port of "Log instance props" brick
- Expected State: Connection line is created
- Assertions:
  - Wait for connection line to appear
  - Verify connection line is visible between "DB" output and "Object" input
  - Verify both connection lines are visible in grid panel

### Phase 13: Execute Function

**Step 13.1: Verify Function is Ready**
- Action: Verify all bricks are connected and configured
- Expected State: Function logic is complete
- Assertions:
  - Verify "List instances by DB name" brick has "Name of DB" configured to "default database"
  - Verify "List instances by DB name" output "List" is connected to "Get first instance" input "List"
  - Verify "Get first instance" output "DB" is connected to "Log instance props" input "Object"
  - Verify RUN button is visible and enabled

**Step 13.2: Click RUN Button**
- Action: Click the RUN button (located above search bar on left side)
- Expected State: Function execution starts
- Assertions:
  - Wait for execution to complete (may take a few seconds)
  - Verify execution completes without errors
  - Verify console area becomes visible or updates

### Phase 14: Verify Console Output

**Step 14.1: Verify Console is Displayed**
- Action: Wait for console output to appear
- Expected State: Console displays execution results
- Assertions:
  - Verify console area is visible
  - Verify console contains output content

**Step 14.2: Verify Console Output Content**
- Action: Read console output content
- Expected State: Console shows logged instance properties
- Assertions:
  - Verify console displays logged instance properties
  - Verify console shows property names and values
  - Verify console shows the string property value from the first database instance
  - Verify console output includes "First Instance Value" (the string property value of the first instance)
  - Verify console output is readable and properly formatted

## Expected Results

### Overall Result
The complete workflow executes successfully from registration through function execution. All steps complete without errors, and the console displays the logged properties of the first database instance.

### Specific Results
1. **Registration**: Both users are successfully registered
2. **Login**: First user successfully logs in and sees Home Screen
3. **Project Creation**: Project is created with default name
4. **Project Rename**: Project name is updated to "My Test Project"
5. **Project Editor**: Project Editor opens successfully with all tabs accessible
6. **User Permissions**: Collaborator user is added to project permissions
7. **Database Instances**: Three instances are created with string values
8. **Function Creation**: Function is created in project
9. **Function Editor**: Function Editor opens successfully
10. **Brick Addition**: All three bricks are added to function
11. **Brick Configuration**: "Name of DB" input is configured to "default database"
12. **Brick Connections**: All bricks are properly connected
13. **Function Execution**: Function executes successfully
14. **Console Output**: Console displays the logged properties of the first instance, including the string property value "First Instance Value"

## Assertions Summary

### Critical Assertions
1. User registration succeeds and redirects to Login Screen
2. User login succeeds and navigates to Home Screen
3. Project is created and appears in project list
4. Project name is successfully renamed
5. Project Editor opens with correct project context
6. Collaborator user is added to permissions list
7. Database instances are created and visible in instance list
8. Function is created and appears in function list
9. Function Editor opens with empty grid
10. All three bricks are added to grid panel
11. "Name of DB" input is configured to "default database"
12. All brick connections are established
13. Function executes without errors
14. Console displays logged instance properties with correct string value

## Error Scenarios

### Potential Error Points
1. **Registration Failure**: If email already exists, test should fail with appropriate error
2. **Login Failure**: If credentials are incorrect, test should fail
3. **Project Creation Failure**: If drop location is invalid, test should fail
4. **Rename Failure**: If project name conflicts, test should fail
5. **Permission Addition Failure**: If user is not registered, test should fail
6. **Instance Creation Failure**: If string value is missing, test should fail
7. **Brick Addition Failure**: If drop location is invalid, test should fail
8. **Connection Failure**: If output/input types don't match, test should fail
9. **Execution Failure**: If connections are incomplete, test should fail
10. **Console Output Failure**: If execution fails, console should show error message

### Error Handling
- All errors should display appropriate error messages as per specifications
- Test should fail fast on any critical error
- Screenshots should be captured on test failure for debugging

## Test Data Cleanup

### After Test Completion
1. Delete test project "My Test Project" and all associated data
2. Delete test users: `test-user-${timestamp}@example.com` and `test-user-collaborator-${timestamp}@example.com`
3. Clean up all database instances created during test
4. Clean up all functions and bricks created during test
5. Clean up all permissions created during test

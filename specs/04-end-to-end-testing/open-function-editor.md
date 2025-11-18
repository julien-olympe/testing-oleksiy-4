# Open Function Editor Test

## Test Name
Open Function Editor

## Description
This test verifies that a user can successfully open the Function Editor for a specific function by double-clicking the function in the Project tab. The Function Editor screen is displayed with the selected function's brick configuration loaded.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Project tab is active)
5. A test function exists in the project's function list (created before test)
6. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load with Project tab active
- Expected State: Project Editor displays with function list
- Assertions:
  - Verify function list is visible
  - Verify test function is visible in function list
  - Verify function name is displayed correctly

**Step 2: Double-Click Function**
- Action: Double-click on the test function in the function list
- Expected State: Navigation to Function Editor is initiated
- Assertions:
  - Wait for navigation to Function Editor
  - Verify URL changes to Function Editor URL (contains `/functions/{functionId}` or similar)

**Step 3: Verify Function Editor Screen Display**
- Action: Wait for Function Editor to fully load
- Expected State: Function Editor screen is displayed
- Assertions:
  - Verify Function Editor screen is displayed
  - Verify settings icon is visible in top-right corner
  - Verify RUN button is visible above search bar on left side
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side

**Step 4: Verify Function Editor Components**
- Action: Verify all Function Editor components are displayed
- Expected State: All components are visible and functional
- Assertions:
  - Verify brick list shows three bricks:
    - "List instances by DB name"
    - "Get first instance"
    - "Log instance props"
  - Verify central grid panel is visible
  - Verify Function Editor is loaded with correct function context

**Step 5: Verify Function Context**
- Action: Verify correct function is loaded
- Expected State: Function Editor shows correct function data
- Assertions:
  - Verify function data is loaded correctly
  - Verify grid panel displays any existing bricks (if function has bricks configured)
  - Verify connection lines are displayed (if function has connections)
  - Verify function context is maintained

**Step 6: Verify Grid Panel**
- Action: Verify grid panel is functional
- Expected State: Grid panel is ready for brick operations
- Assertions:
  - Verify grid panel is visible and accessible
  - Verify grid panel supports drag-and-drop operations
  - Verify grid panel can display bricks and connections

**Step 7: Verify Bricks Can Be Added**
- Action: Verify brick list is functional
- Expected State: Bricks can be added to function
- Assertions:
  - Verify "List instances by DB name" brick is draggable
  - Verify "Get first instance" brick is draggable
  - Verify "Log instance props" brick is draggable
  - Verify bricks can be dragged to grid panel

## Expected Results
1. Double-click on function triggers navigation to Function Editor
2. Function Editor screen is displayed correctly
3. All Function Editor components are visible and functional
4. Correct function context is loaded
5. Grid panel is visible and functional
6. Brick list displays all available bricks
7. Function Editor maintains function context throughout

## Assertions
1. Double-click action works correctly
2. Navigation to Function Editor occurs successfully
3. Function Editor screen displays all required components
4. RUN button is visible and accessible
5. Brick list displays all three required bricks
6. Grid panel is visible and functional
7. Function context is loaded correctly
8. Existing bricks and connections are displayed (if any)

## Error Scenarios
If function does not exist or user does not have permission:
- Error message "Function not found" or "Failed to load function" should be displayed
- User should be redirected to Project Editor or Home Screen
- Function Editor should not be displayed

### Test Case: Function with Existing Bricks

**Step E.1: Create Function with Bricks**
- Action: Before opening Function Editor, add bricks to function (via Function Editor or setup)
- Expected State: Function has bricks configured
- Assertions:
  - Verify function has bricks

**Step E.2: Open Function Editor**
- Action: Double-click function to open Function Editor
- Expected State: Function Editor displays with existing bricks
- Assertions:
  - Verify existing bricks are displayed in grid panel
  - Verify connection lines are displayed (if connections exist)
  - Verify brick configurations are loaded correctly

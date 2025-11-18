# Rename Function Positive Test

## Test Name
Rename Function - Successful Rename

## Description
This test verifies that a user can successfully rename an existing function within a project. The function name is updated in the database.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Project tab is active)
5. A test function exists in the project's function list (created before test or during test setup)
6. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load with Project tab active
- Expected State: Project Editor displays with function list
- Assertions:
  - Verify function list is visible
  - Verify test function is visible in function list
  - Verify function has current name (e.g., "New Function" or "Function 1")

**Step 2: Select Function**
- Action: Click on the function to select it, or right-click to access context menu
- Expected State: Function is selected
- Assertions:
  - Verify function is selected (visual indication may be present)
  - Verify context menu appears (if right-click) or function is ready for rename

**Step 3: Access Rename Interface**
- Action: Access rename option (context menu "Rename" option, or inline editing, or double-click name)
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible or becomes editable
  - Verify current function name is displayed in input field
  - Verify input field is focused and ready for editing

**Step 4: Enter New Function Name**
- Action: Clear current name and enter new function name: `Renamed Function ${timestamp}`
- Expected State: Function name field contains new name
- Assertions:
  - Verify input field contains new name
  - Verify old name is replaced

**Step 5: Confirm Rename**
- Action: Confirm rename (press Enter key, or click confirm button, or click outside input)
- Expected State: Function name is updated
- Assertions:
  - Wait for function name to update in function list
  - Verify function list shows function with new name "Renamed Function ${timestamp}"
  - Verify rename interface is closed
  - Verify function is still visible in function list

**Step 6: Verify Rename Persistence**
- Action: Refresh page or navigate away and back to Project Editor
- Expected State: Renamed function persists
- Assertions:
  - Verify function still appears in function list with new name
  - Verify old name is no longer displayed
  - Verify function name is persisted in database

## Expected Results
1. Function can be selected for rename
2. Rename interface is accessible and functional
3. New function name can be entered
4. Rename confirmation updates function name
5. Function list displays updated name immediately
6. Function name is persisted in database
7. Renamed function persists after page refresh

## Assertions
1. Function selection works correctly
2. Rename interface is displayed and functional
3. Input field accepts new name
4. Rename confirmation updates function name in UI
5. Function name is updated in database
6. Function list reflects new name
7. Renamed function persists after page refresh
8. Function remains associated with current project

## Error Scenarios
This is a positive test case. Error scenarios are covered in `rename-function-negative.md`.

# Delete Function Test

## Test Name
Delete Function

## Description
This test verifies that a user can successfully delete a function from a project. All brick configurations and connections within the function are deleted.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Project tab is active)
5. A test function exists in the project's function list (created before test)
6. The test function may have brick configurations and connections (for comprehensive deletion test)
7. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load with Project tab active
- Expected State: Project Editor displays with function list
- Assertions:
  - Verify function list is visible
  - Verify test function is visible in function list
  - Verify function count before deletion (for comparison)

**Step 2: Select Function**
- Action: Click on the function to select it, or right-click to access context menu
- Expected State: Function is selected
- Assertions:
  - Verify function is selected
  - Verify context menu appears (if right-click) or delete option is accessible

**Step 3: Access Delete Option**
- Action: Access delete option (context menu "Delete" option, or delete button)
- Expected State: Delete confirmation dialog is displayed
- Assertions:
  - Verify confirmation dialog is displayed
  - Verify dialog shows function name or confirmation message
  - Verify "Confirm" or "Delete" button is visible
  - Verify "Cancel" button is visible

**Step 4: Confirm Deletion**
- Action: Click "Confirm" or "Delete" button in confirmation dialog
- Expected State: Function deletion is processed
- Assertions:
  - Wait for deletion to complete
  - Verify confirmation dialog is closed

**Step 5: Verify Function Removed from List**
- Action: Verify function list after deletion
- Expected State: Function is removed from function list
- Assertions:
  - Verify test function no longer appears in function list
  - Verify function count decreased by 1
  - Verify other functions (if any) remain in list

**Step 6: Verify Function Persistence (Negative Check)**
- Action: Refresh page or navigate away and back to Project Editor
- Expected State: Deleted function does not reappear
- Assertions:
  - Verify deleted function does not appear in function list after refresh
  - Verify function is permanently deleted from database

**Step 7: Verify Associated Data Deletion (If Applicable)**
- Action: If test function had bricks and connections, verify they are also deleted
- Expected State: All associated data is deleted
- Assertions:
  - Verify brick configurations associated with function are deleted
  - Verify connection data associated with function is deleted
  - Verify function cannot be opened in Function Editor (function no longer exists)

## Expected Results
1. Function can be selected for deletion
2. Delete confirmation dialog is displayed
3. Deletion confirmation removes function from list
4. Function is permanently deleted from database
5. Function does not reappear after page refresh
6. All associated brick configurations and connections are deleted
7. Other functions remain unaffected

## Assertions
1. Function selection works correctly
2. Delete option is accessible and functional
3. Confirmation dialog is displayed with appropriate message
4. Deletion confirmation removes function from UI
5. Function is deleted from database
6. Function list reflects deletion immediately
7. Deleted function does not persist after page refresh
8. Cascade deletion works correctly (bricks, connections)

## Error Scenarios
According to specifications, deletion should always succeed if user has permission. However, if deletion fails:
- Error message "Delete failed" should be displayed
- Function should remain in function list
- Database state should remain unchanged

### Test Case: Cancel Deletion

**Step C.1: Access Delete Option**
- Action: Select function and access delete option
- Expected State: Confirmation dialog is displayed
- Assertions:
  - Verify confirmation dialog is displayed

**Step C.2: Cancel Deletion**
- Action: Click "Cancel" button in confirmation dialog
- Expected State: Deletion is cancelled
- Assertions:
  - Verify confirmation dialog is closed
  - Verify function remains in function list
  - Verify function is not deleted
  - Verify function count is unchanged

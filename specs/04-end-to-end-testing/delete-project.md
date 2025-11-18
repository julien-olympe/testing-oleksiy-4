# Delete Project Test

## Test Name
Delete Project

## Description
This test verifies that a logged-in user can successfully delete a project they own. The project and all associated functions and data are permanently removed from the system.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated (on Home Screen)
4. A test project exists in the user's project list (created before test)
5. The test project may have associated functions, permissions, and database instances (for comprehensive deletion test)
6. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with project list
- Assertions:
  - Verify project list is visible
  - Verify test project is visible in project list
  - Verify project count before deletion (for comparison)

**Step 2: Select Project**
- Action: Click on the project to select it, or right-click to access context menu
- Expected State: Project is selected
- Assertions:
  - Verify project is selected
  - Verify context menu appears (if right-click) or delete option is accessible

**Step 3: Access Delete Option**
- Action: Access delete option (context menu "Delete" option, or delete button)
- Expected State: Delete confirmation dialog is displayed
- Assertions:
  - Verify confirmation dialog is displayed
  - Verify dialog shows project name or confirmation message
  - Verify "Confirm" or "Delete" button is visible
  - Verify "Cancel" button is visible

**Step 4: Confirm Deletion**
- Action: Click "Confirm" or "Delete" button in confirmation dialog
- Expected State: Project deletion is processed
- Assertions:
  - Wait for deletion to complete
  - Verify confirmation dialog is closed

**Step 5: Verify Project Removed from List**
- Action: Verify project list after deletion
- Expected State: Project is removed from project list
- Assertions:
  - Verify test project no longer appears in project list
  - Verify project count decreased by 1
  - Verify other projects (if any) remain in list

**Step 6: Verify Project Persistence (Negative Check)**
- Action: Refresh page or navigate away and back to Home Screen
- Expected State: Deleted project does not reappear
- Assertions:
  - Verify deleted project does not appear in project list after refresh
  - Verify project is permanently deleted from database

**Step 7: Verify Associated Data Deletion (If Applicable)**
- Action: If test project had functions, verify they are also deleted
- Expected State: All associated data is deleted
- Assertions:
  - Verify functions associated with project are deleted (cannot open project editor)
  - Verify permissions associated with project are deleted
  - Verify database instances associated with project are deleted (if applicable)

## Expected Results
1. Project can be selected for deletion
2. Delete confirmation dialog is displayed
3. Deletion confirmation removes project from list
4. Project is permanently deleted from database
5. Project does not reappear after page refresh
6. All associated functions, permissions, and data are deleted
7. Other projects remain unaffected

## Assertions
1. Project selection works correctly
2. Delete option is accessible and functional
3. Confirmation dialog is displayed with appropriate message
4. Deletion confirmation removes project from UI
5. Project is deleted from database
6. Project list reflects deletion immediately
7. Deleted project does not persist after page refresh
8. Cascade deletion works correctly (functions, permissions, instances)

## Error Scenarios
According to specifications, deletion should always succeed if user owns the project. However, if deletion fails:
- Error message "Delete failed" should be displayed
- Project should remain in project list
- Database state should remain unchanged

### Test Case: Cancel Deletion

**Step C.1: Access Delete Option**
- Action: Select project and access delete option
- Expected State: Confirmation dialog is displayed
- Assertions:
  - Verify confirmation dialog is displayed

**Step C.2: Cancel Deletion**
- Action: Click "Cancel" button in confirmation dialog
- Expected State: Deletion is cancelled
- Assertions:
  - Verify confirmation dialog is closed
  - Verify project remains in project list
  - Verify project is not deleted
  - Verify project count is unchanged

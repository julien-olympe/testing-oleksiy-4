# View Users Permissions Test

## Test Name
View Users with Permissions

## Description
This test verifies that a user can view the list of users who have access permissions for the current project. The list includes the project owner and all users who have been granted permissions.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User A (project owner) is logged in and authenticated
4. User A is in Project Editor for a test project
5. User B exists in the system and has been granted permissions for the test project (created before test)
6. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load
- Expected State: Project Editor displays with all tabs
- Assertions:
  - Verify tab bar is visible with three tabs: "Project", "Permissions", "Database"
  - Verify "Project" tab is active by default

**Step 2: Navigate to Permissions Tab**
- Action: Click on "Permissions" tab in the tab bar
- Expected State: Permissions tab is displayed
- Assertions:
  - Verify "Permissions" tab becomes active
  - Verify Permissions tab content is displayed
  - Verify user list area is visible

**Step 3: Verify Project Owner is Displayed**
- Action: Verify project owner appears in user list
- Expected State: Project owner is displayed with indicator
- Assertions:
  - Verify project owner (User A) appears in user list
  - Verify project owner is indicated (e.g., "Owner" label or special indicator)
  - Verify project owner's email or name is displayed

**Step 4: Verify Users with Permissions are Displayed**
- Action: Verify users with permissions appear in user list
- Expected State: All users with permissions are displayed
- Assertions:
  - Verify User B (with permissions) appears in user list
  - Verify User B's email or name is displayed
  - Verify all users with permissions are listed

**Step 5: Verify User List Details**
- Action: Verify user list item details
- Expected State: Each user displays correctly
- Assertions:
  - Verify each user shows email address or name
  - Verify project owner indicator is visible
  - Verify users are properly formatted and visible
  - Verify user list is scrollable if there are many users

**Step 6: Verify Empty State (If Applicable)**
- Action: If testing with a project that has no additional users with permissions, verify display
- Expected State: Only project owner is displayed
- Assertions:
  - Verify only project owner is displayed (if no other users have permissions)
  - Verify user list shows at least the project owner
  - Verify "Add user" button is visible (for project owner)

**Step 7: Verify User List Persistence**
- Action: Refresh page or switch tabs and return to Permissions tab
- Expected State: User list persists and displays correctly
- Assertions:
  - Verify user list still displays after refresh
  - Verify same users are displayed
  - Verify project owner is still indicated
  - Verify user list is accurate

## Expected Results
1. Permissions tab displays user list area
2. Project owner is displayed with indicator
3. All users with permissions are displayed
4. User emails or names are visible and readable
5. User list is properly formatted
6. Empty state shows only project owner (if no other users)
7. User list persists after page refresh

## Assertions
1. Permissions tab is accessible and functional
2. User list is visible and displays correctly
3. Project owner is displayed with appropriate indicator
4. All users with permissions are displayed
5. User list items are properly formatted
6. User list persists after page refresh
7. User list accurately reflects project permissions

## Error Scenarios
This is a positive test case. However, potential issues to verify:
- If database query fails, appropriate error should be displayed
- If user session is invalid, user should be redirected to Login Screen
- If permissions fail to load, error message should be displayed

### Test Case: Project with No Additional Users

**Step E.1: Navigate to Permissions Tab**
- Action: Open Permissions tab for a project with no additional users
- Expected State: Permissions tab displays only project owner
- Assertions:
  - Verify only project owner is displayed
  - Verify no other users are listed
  - Verify "Add user" button is visible (for project owner)

# View Projects Test

## Test Name
View Projects

## Description
This test verifies that a logged-in user can view the list of projects they own. The system displays only projects belonging to the logged-in user, ensuring user isolation.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated (on Home Screen)
4. Test projects exist in the database:
   - At least 2-3 projects owned by the logged-in user
   - At least 1 project owned by a different user (to verify user isolation)
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Login and Navigate to Home Screen**
- Action: Log in with test user credentials
- Expected State: User is authenticated and on Home Screen
- Assertions:
  - Verify user is on Home Screen
  - Verify URL is correct for Home Screen

**Step 2: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with all components
- Assertions:
  - Verify settings icon is visible in top-right corner
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side
  - Verify project list area is visible in center/right side

**Step 3: Verify Project List is Displayed**
- Action: Verify project list is visible and populated
- Expected State: Project list shows user's projects
- Assertions:
  - Verify project list area is visible
  - Verify project list contains projects
  - Verify all projects owned by logged-in user are displayed
  - Verify project names are visible and readable

**Step 4: Verify User Isolation**
- Action: Verify that only user's own projects are displayed
- Expected State: Only projects owned by logged-in user are shown
- Assertions:
  - Verify projects owned by other users are NOT displayed
  - Verify project count matches expected count (only user's projects)
  - Verify each displayed project belongs to logged-in user

**Step 5: Verify Project List Details**
- Action: Verify project list item details
- Expected State: Each project displays correctly
- Assertions:
  - Verify each project shows project name
  - Verify projects are clickable (can be selected)
  - Verify projects support double-click (for opening)
  - Verify projects are properly formatted and visible

**Step 6: Verify Empty State (If Applicable)**
- Action: If testing with a new user with no projects, verify empty state
- Expected State: Empty state message is displayed
- Assertions:
  - Verify "No projects" message is displayed (if user has no projects)
  - Verify project list area is visible but empty
  - Verify user can still create new projects

**Step 7: Verify Project List Persistence**
- Action: Refresh page
- Expected State: Project list persists after refresh
- Assertions:
  - Verify project list still displays after page refresh
  - Verify same projects are displayed
  - Verify project count is unchanged
  - Verify user isolation is maintained

## Expected Results
1. Home Screen displays project list area
2. Project list shows all projects owned by logged-in user
3. Projects owned by other users are not displayed (user isolation)
4. Project names are visible and readable
5. Projects are interactive (clickable, double-clickable)
6. Empty state is displayed if user has no projects
7. Project list persists after page refresh

## Assertions
1. Home Screen displays correctly with all components
2. Project list is visible and functional
3. All user's projects are displayed
4. User isolation is enforced (other users' projects are not shown)
5. Project list items are properly formatted
6. Projects are interactive and functional
7. Empty state message is displayed when appropriate
8. Project list persists after page refresh

## Error Scenarios
This is a positive test case. However, potential issues to verify:
- If database query fails, appropriate error should be displayed
- If user session is invalid, user should be redirected to Login Screen
- If projects fail to load, error message should be displayed

### Test Case: Empty Project List

**Step E.1: Login with New User**
- Action: Log in with a new user that has no projects
- Expected State: User is on Home Screen
- Assertions:
  - Verify user is authenticated

**Step E.2: Verify Empty State**
- Action: Verify project list area
- Expected State: Empty state is displayed
- Assertions:
  - Verify "No projects" message is displayed (or project list is empty)
  - Verify user can still create new projects (brick list is available)

# View Databases Test

## Test Name
View Databases

## Description
This test verifies that a user can view the list of databases available in the current project. The system displays the default database and any additional databases.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load
- Expected State: Project Editor displays with all tabs
- Assertions:
  - Verify tab bar is visible with three tabs: "Project", "Permissions", "Database"
  - Verify "Project" tab is active by default

**Step 2: Navigate to Database Tab**
- Action: Click on "Database" tab in the tab bar
- Expected State: Database tab is displayed
- Assertions:
  - Verify "Database" tab becomes active
  - Verify Database tab content is displayed
  - Verify database list area is visible on left side
  - Verify instance list area is visible on right side

**Step 3: Verify Default Database is Displayed**
- Action: Verify default database appears in database list
- Expected State: Default database is displayed
- Assertions:
  - Verify "default database" appears in database list on left side
  - Verify default database is visible and selectable
  - Verify default database name is displayed correctly

**Step 4: Verify Database List Layout**
- Action: Verify database list layout and components
- Expected State: Database list displays correctly
- Assertions:
  - Verify database list is on left side of Database tab
  - Verify database list shows database names
  - Verify database list may show database properties
  - Verify "Create instance" button is visible (when database is selected)

**Step 5: Verify Instance List Area**
- Action: Verify instance list area is displayed
- Expected State: Instance list area is visible
- Assertions:
  - Verify instance list area is on right side of Database tab
  - Verify instance list area is visible (may be empty if no instances)
  - Verify instance list is ready to display instances when database is selected

**Step 6: Select Default Database**
- Action: Click on "default database" in the database list
- Expected State: Default database is selected
- Assertions:
  - Verify default database is selected (visual indication may be present)
  - Verify instance list area updates to show instances for default database
  - Verify "Create instance" button becomes available (if not already visible)

**Step 7: Verify Database Persistence**
- Action: Refresh page or switch tabs and return to Database tab
- Expected State: Database list persists and displays correctly
- Assertions:
  - Verify database list still displays after refresh
  - Verify default database is still displayed
  - Verify database list is accurate

## Expected Results
1. Database tab displays database list area on left side
2. Default database is always displayed in database list
3. Database list shows database names and properties
4. Instance list area is visible on right side
5. Default database can be selected
6. Database list persists after page refresh
7. Database list accurately reflects project databases

## Assertions
1. Database tab is accessible and functional
2. Database list is visible and displays correctly
3. Default database is always present and displayed
4. Database list layout is correct (left side)
5. Instance list area is visible (right side)
6. Database selection works correctly
7. Database list persists after page refresh

## Error Scenarios
This is a positive test case. However, potential issues to verify:
- If database query fails, appropriate error should be displayed
- If user session is invalid, user should be redirected to Login Screen
- If databases fail to load, error message should be displayed

### Test Case: Project with Additional Databases (If Applicable)

**Step A.1: Verify Additional Databases**
- Action: If project has additional databases (beyond default), verify they are displayed
- Expected State: All databases are displayed
- Assertions:
  - Verify all databases appear in database list
  - Verify default database and additional databases are all visible
  - Verify database list is scrollable if there are many databases

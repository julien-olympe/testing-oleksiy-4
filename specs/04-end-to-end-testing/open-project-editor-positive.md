# Open Project Editor Positive Test

## Test Name
Open Project Editor - Successful Opening

## Description
This test verifies that a logged-in user can successfully open the Project Editor for a project they own by double-clicking the project in the project list. The Project Editor screen is displayed with the selected project context.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated (on Home Screen)
4. A test project exists in the user's project list (created before test)
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with project list
- Assertions:
  - Verify project list is visible
  - Verify test project is visible in project list
  - Verify project name is displayed correctly

**Step 2: Double-Click Project**
- Action: Double-click on the test project in the project list
- Expected State: Navigation to Project Editor is initiated
- Assertions:
  - Wait for navigation to Project Editor
  - Verify URL changes to Project Editor URL (contains `/projects/{projectId}` or similar)

**Step 3: Verify Project Editor Screen Display**
- Action: Wait for Project Editor to fully load
- Expected State: Project Editor screen is displayed
- Assertions:
  - Verify Project Editor screen is displayed
  - Verify settings icon is visible in top-right corner
  - Verify tab bar is visible with three tabs: "Project", "Permissions", "Database"
  - Verify "Project" tab is active by default

**Step 4: Verify Project Editor Components**
- Action: Verify all Project Editor components are displayed
- Expected State: All components are visible and functional
- Assertions:
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side showing "Function" brick
  - Verify function list area is visible in central area (Project tab content)
  - Verify Project Editor is loaded with correct project context

**Step 5: Verify Project Tab Content**
- Action: Verify Project tab displays correctly
- Expected State: Project tab shows function list
- Assertions:
  - Verify "Project" tab is active
  - Verify function list area is visible (may be empty if no functions exist)
  - Verify "Function" brick is available in brick list

**Step 6: Verify Project Context**
- Action: Verify correct project is loaded
- Expected State: Project Editor shows correct project data
- Assertions:
  - Verify project data is loaded correctly
  - Verify function list (if any) shows functions for this project
  - Verify project context is maintained

**Step 7: Verify Navigation Between Tabs**
- Action: Click on "Permissions" tab, then "Database" tab, then back to "Project" tab
- Expected State: Tabs switch correctly
- Assertions:
  - Verify "Permissions" tab becomes active when clicked
  - Verify Permissions tab content is displayed
  - Verify "Database" tab becomes active when clicked
  - Verify Database tab content is displayed
  - Verify "Project" tab becomes active when clicked again
  - Verify Project tab content is displayed

## Expected Results
1. Double-click on project triggers navigation to Project Editor
2. Project Editor screen is displayed correctly
3. All Project Editor components are visible and functional
4. Project tab is active by default
5. Correct project context is loaded
6. All tabs are accessible and functional
7. Project Editor maintains project context throughout

## Assertions
1. Double-click action works correctly
2. Navigation to Project Editor occurs successfully
3. Project Editor screen displays all required components
4. Project tab is active by default
5. Project context is loaded correctly
6. Function list area is visible (may be empty)
7. All tabs are functional and switch correctly
8. Project Editor maintains correct project context

## Error Scenarios
This is a positive test case. Error scenarios are covered in `open-project-editor-negative.md`.

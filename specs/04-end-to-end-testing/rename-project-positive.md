# Rename Project Positive Test

## Test Name
Rename Project - Successful Rename

## Description
This test verifies that a logged-in user can successfully rename an existing project they own. The project name is updated in the database and displayed in the project list.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated (on Home Screen)
4. A test project exists in the user's project list (created before test or during test setup)
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with project list
- Assertions:
  - Verify project list is visible
  - Verify test project is visible in project list
  - Verify project has current name (e.g., "New Project" or "Project 1")

**Step 2: Select Project**
- Action: Click on the project to select it, or right-click to access context menu
- Expected State: Project is selected
- Assertions:
  - Verify project is selected (visual indication may be present)
  - Verify context menu appears (if right-click) or project is ready for rename

**Step 3: Access Rename Interface**
- Action: Access rename option (context menu "Rename" option, or inline editing, or double-click name)
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible or becomes editable
  - Verify current project name is displayed in input field
  - Verify input field is focused and ready for editing

**Step 4: Enter New Project Name**
- Action: Clear current name and enter new project name: `Renamed Project ${timestamp}`
- Expected State: Project name field contains new name
- Assertions:
  - Verify input field contains new name
  - Verify old name is replaced

**Step 5: Confirm Rename**
- Action: Confirm rename (press Enter key, or click confirm button, or click outside input)
- Expected State: Project name is updated
- Assertions:
  - Wait for project name to update in project list
  - Verify project list shows project with new name "Renamed Project ${timestamp}"
  - Verify rename interface is closed
  - Verify project is still visible in project list

**Step 6: Verify Rename Persistence**
- Action: Refresh page or navigate away and back to Home Screen
- Expected State: Renamed project persists
- Assertions:
  - Verify project still appears in project list with new name
  - Verify old name is no longer displayed
  - Verify project name is persisted in database

## Expected Results
1. Project can be selected for rename
2. Rename interface is accessible and functional
3. New project name can be entered
4. Rename confirmation updates project name
5. Project list displays updated name immediately
6. Project name is persisted in database
7. Renamed project persists after page refresh

## Assertions
1. Project selection works correctly
2. Rename interface is displayed and functional
3. Input field accepts new name
4. Rename confirmation updates project name in UI
5. Project name is updated in database
6. Project list reflects new name
7. Renamed project persists after page refresh
8. Project remains associated with logged-in user

## Error Scenarios
This is a positive test case. Error scenarios are covered in `rename-project-negative.md`.

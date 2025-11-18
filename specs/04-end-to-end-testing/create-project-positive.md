# Create Project Positive Test

## Test Name
Create Project - Successful Project Creation

## Description
This test verifies that a logged-in user can successfully create a new project by dragging the "Project" brick from the brick list to the project list area. The new project is created with a default name and added to the user's project list.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated (on Home Screen)
4. Home Screen is displayed with brick list and project list area
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with all components
- Assertions:
  - Verify settings icon is visible in top-right corner
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side
  - Verify project list area is visible in center/right side
  - Verify "Project" brick is visible in brick list

**Step 2: Locate Project Brick**
- Action: Verify "Project" brick is visible in brick list
- Expected State: "Project" brick is displayed in brick list
- Assertions:
  - Verify "Project" brick is visible in brick list on left side
  - Verify brick list is scrollable if needed
  - Verify "Project" brick is draggable

**Step 3: Drag Project Brick**
- Action: Drag "Project" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts (visual feedback may be present)
  - Verify brick can be dragged

**Step 4: Drop Project Brick in Project List Area**
- Action: Drop "Project" brick in the project list area (center/right side)
- Expected State: Project is created
- Assertions:
  - Wait for new project to appear in project list
  - Verify new project appears in project list
  - Verify project has a default name (e.g., "New Project" or "Project 1")
  - Verify project is visible and rendered correctly

**Step 5: Verify Project in List**
- Action: Verify project details
- Expected State: Project is properly displayed
- Assertions:
  - Verify project name is displayed correctly
  - Verify project is clickable (can be selected)
  - Verify project can be double-clicked (for opening)
  - Verify project appears only once in the list

**Step 6: Verify Project Persistence**
- Action: Refresh page or navigate away and back to Home Screen
- Expected State: Project persists after page refresh
- Assertions:
  - Verify project still appears in project list after refresh
  - Verify project name is unchanged
  - Verify project is associated with logged-in user

## Expected Results
1. "Project" brick is visible and draggable in brick list
2. Drag operation starts successfully
3. Drop operation in project list area is accepted
4. New project is created with default name
5. Project appears in project list immediately
6. Project is persisted in database
7. Project persists after page refresh

## Assertions
1. Home Screen displays all required components
2. "Project" brick is available in brick list
3. Drag-and-drop operation works correctly
4. Project is created in valid drop location
5. Project appears in project list with default name
6. Project is associated with logged-in user (user isolation)
7. Project is persisted in database
8. Project remains visible after page refresh

## Error Scenarios
This is a positive test case. Error scenarios are covered in `create-project-negative.md`.

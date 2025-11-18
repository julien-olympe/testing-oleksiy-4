# Create Function Positive Test

## Test Name
Create Function - Successful Function Creation

## Description
This test verifies that a user can successfully create a new function within a project by dragging the "Function" brick from the brick list to the function list area in the Project tab. The new function is created with a default name.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Project tab is active)
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load
- Expected State: Project Editor displays with Project tab active
- Assertions:
  - Verify settings icon is visible in top-right corner
  - Verify tab bar is visible with "Project" tab active
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side
  - Verify function list area is visible in central area

**Step 2: Locate Function Brick**
- Action: Verify "Function" brick is visible in brick list
- Expected State: "Function" brick is displayed in brick list
- Assertions:
  - Verify "Function" brick is visible in brick list on left side
  - Verify brick list is scrollable if needed
  - Verify "Function" brick is draggable

**Step 3: Drag Function Brick**
- Action: Drag "Function" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts (visual feedback may be present)
  - Verify brick can be dragged

**Step 4: Drop Function Brick in Function List Area**
- Action: Drop "Function" brick in the function list area (central area of Project tab)
- Expected State: Function is created
- Assertions:
  - Wait for new function to appear in function list
  - Verify new function appears in function list
  - Verify function has a default name (e.g., "New Function" or "Function 1")
  - Verify function is visible and rendered correctly

**Step 5: Verify Function in List**
- Action: Verify function details
- Expected State: Function is properly displayed
- Assertions:
  - Verify function name is displayed correctly
  - Verify function is clickable (can be selected)
  - Verify function can be double-clicked (for opening Function Editor)
  - Verify function appears only once in the list

**Step 6: Verify Function Persistence**
- Action: Refresh page or navigate away and back to Project Editor
- Expected State: Function persists after page refresh
- Assertions:
  - Verify function still appears in function list after refresh
  - Verify function name is unchanged
  - Verify function is associated with current project

## Expected Results
1. "Function" brick is visible and draggable in brick list
2. Drag operation starts successfully
3. Drop operation in function list area is accepted
4. New function is created with default name
5. Function appears in function list immediately
6. Function is persisted in database
7. Function persists after page refresh

## Assertions
1. Project Editor displays all required components
2. "Function" brick is available in brick list
3. Drag-and-drop operation works correctly
4. Function is created in valid drop location
5. Function appears in function list with default name
6. Function is associated with current project
7. Function is persisted in database
8. Function remains visible after page refresh

## Error Scenarios
This is a positive test case. Error scenarios are covered in `create-function-negative.md`.

# Create Project Negative Test

## Test Name
Create Project - Error Cases

## Description
This test verifies that the project creation system properly handles invalid drop locations and error conditions. It tests dropping the "Project" brick outside the valid project list area.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated (on Home Screen)
4. Home Screen is displayed with brick list and project list area
5. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Invalid Drop Location - Outside Project List Area

**Step 1.1: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with all components
- Assertions:
  - Verify "Project" brick is visible in brick list
  - Verify project list area is visible

**Step 1.2: Drag Project Brick**
- Action: Drag "Project" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts

**Step 1.3: Drop Project Brick Outside Project List Area**
- Action: Drop "Project" brick outside the project list area (e.g., on search bar, on brick list, on settings icon, or outside the application area)
- Expected State: Drop is rejected
- Assertions:
  - Verify no new project is created
  - Verify project list remains unchanged
  - Verify error message is displayed: "Invalid drop location" (if error messages are shown for invalid drops)
  - Verify drag operation is cancelled

### Test Case 2: Drop on Invalid Element

**Step 2.1: Drag Project Brick**
- Action: Drag "Project" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts

**Step 2.2: Drop on Search Bar**
- Action: Drop "Project" brick on the search bar
- Expected State: Drop is rejected
- Assertions:
  - Verify no new project is created
  - Verify project list remains unchanged
  - Verify search bar functionality is not affected

**Step 2.3: Drop on Settings Icon**
- Action: Drag "Project" brick again and drop on settings icon
- Expected State: Drop is rejected
- Assertions:
  - Verify no new project is created
  - Verify project list remains unchanged
  - Verify settings icon functionality is not affected

## Expected Results
1. Dropping "Project" brick outside project list area is rejected
2. No project is created for invalid drop locations
3. Project list remains unchanged after invalid drop
4. Error message may be displayed for invalid drop (if implemented)
5. Application remains in consistent state after invalid drop

## Assertions
1. Invalid drop locations are rejected
2. No project is created for invalid drops
3. Project list count remains unchanged
4. Error message is displayed if error messaging is implemented for invalid drops
5. Application state remains consistent
6. No database operations occur for invalid drops

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Invalid drop location (outside project list area)
- Drop on invalid UI elements (search bar, settings icon)

Note: According to specifications, error message "Invalid drop location" should be displayed if brick is dropped outside project list area. If error messages are not shown for invalid drops, the test should verify that no project is created and the application state remains unchanged.

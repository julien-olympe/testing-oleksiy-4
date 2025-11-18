# Add Brick Negative Test

## Test Name
Add Brick to Function - Error Cases

## Description
This test verifies that the system properly handles invalid drop locations and error conditions when attempting to add bricks to the Function Editor. It tests dropping bricks outside the valid grid panel area.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Invalid Drop Location - Outside Grid Panel

**Step 1.1: Verify Function Editor Display**
- Action: Wait for Function Editor to fully load
- Expected State: Function Editor displays with grid panel
- Assertions:
  - Verify brick list is visible
  - Verify central grid panel is visible

**Step 1.2: Drag Brick**
- Action: Drag "List instances by DB name" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts

**Step 1.3: Drop Brick Outside Grid Panel**
- Action: Drop brick outside the grid panel (e.g., on search bar, on brick list, on RUN button, on settings icon, or outside the application area)
- Expected State: Drop is rejected
- Assertions:
  - Verify no brick is added to grid panel
  - Verify grid panel remains unchanged
  - Verify error message is displayed: "Invalid drop location" (if error messages are shown for invalid drops)
  - Verify drag operation is cancelled

### Test Case 2: Drop on Invalid Element

**Step 2.1: Drag Brick**
- Action: Drag "Get first instance" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts

**Step 2.2: Drop on Search Bar**
- Action: Drop brick on the search bar
- Expected State: Drop is rejected
- Assertions:
  - Verify no brick is added to grid panel
  - Verify grid panel remains unchanged
  - Verify search bar functionality is not affected

**Step 2.3: Drop on RUN Button**
- Action: Drag brick again and drop on RUN button
- Expected State: Drop is rejected
- Assertions:
  - Verify no brick is added to grid panel
  - Verify grid panel remains unchanged
  - Verify RUN button functionality is not affected

**Step 2.4: Drop on Settings Icon**
- Action: Drag brick again and drop on settings icon
- Expected State: Drop is rejected
- Assertions:
  - Verify no brick is added to grid panel
  - Verify grid panel remains unchanged
  - Verify settings icon functionality is not affected

## Expected Results
1. Dropping brick outside grid panel is rejected
2. No brick is added for invalid drop locations
3. Grid panel remains unchanged after invalid drop
4. Error message may be displayed for invalid drop (if implemented)
5. Application remains in consistent state after invalid drop

## Assertions
1. Invalid drop locations are rejected
2. No brick is added for invalid drops
3. Grid panel remains unchanged
4. Error message is displayed if error messaging is implemented for invalid drops
5. Application state remains consistent
6. No database operations occur for invalid drops

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Invalid drop location (outside grid panel)
- Drop on invalid UI elements (search bar, RUN button, settings icon)

Note: According to specifications, error message "Invalid drop location" should be displayed if brick is dropped outside grid panel. If error messages are not shown for invalid drops, the test should verify that no brick is added and the application state remains unchanged.

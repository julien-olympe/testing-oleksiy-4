# Create Function Negative Test

## Test Name
Create Function - Error Cases

## Description
This test verifies that the function creation system properly handles invalid drop locations and error conditions. It tests dropping the "Function" brick outside the valid function list area.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Project tab is active)
5. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Invalid Drop Location - Outside Function List Area

**Step 1.1: Verify Project Editor Display**
- Action: Wait for Project Editor to fully load
- Expected State: Project Editor displays with Project tab active
- Assertions:
  - Verify "Function" brick is visible in brick list
  - Verify function list area is visible in central area

**Step 1.2: Drag Function Brick**
- Action: Drag "Function" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts

**Step 1.3: Drop Function Brick Outside Function List Area**
- Action: Drop "Function" brick outside the function list area (e.g., on search bar, on brick list, on tab bar, on settings icon, or in Permissions/Database tab)
- Expected State: Drop is rejected
- Assertions:
  - Verify no new function is created
  - Verify function list remains unchanged
  - Verify error message is displayed: "Invalid drop location" (if error messages are shown for invalid drops)
  - Verify drag operation is cancelled

### Test Case 2: Drop on Invalid Element

**Step 2.1: Drag Function Brick**
- Action: Drag "Function" brick from brick list
- Expected State: Brick is being dragged
- Assertions:
  - Verify drag operation starts

**Step 2.2: Drop on Search Bar**
- Action: Drop "Function" brick on the search bar
- Expected State: Drop is rejected
- Assertions:
  - Verify no new function is created
  - Verify function list remains unchanged
  - Verify search bar functionality is not affected

**Step 2.3: Drop on Tab Bar**
- Action: Drag "Function" brick again and drop on tab bar (e.g., on "Permissions" or "Database" tab)
- Expected State: Drop is rejected
- Assertions:
  - Verify no new function is created
  - Verify function list remains unchanged
  - Verify tab bar functionality is not affected

**Step 2.4: Drop in Wrong Tab**
- Action: Switch to "Permissions" tab, drag "Function" brick, and drop in Permissions tab area
- Expected State: Drop is rejected
- Assertions:
  - Verify no new function is created
  - Verify function list remains unchanged
  - Verify "Function" brick can only be dropped in Project tab function list area

## Expected Results
1. Dropping "Function" brick outside function list area is rejected
2. No function is created for invalid drop locations
3. Function list remains unchanged after invalid drop
4. Error message may be displayed for invalid drop (if implemented)
5. Application remains in consistent state after invalid drop

## Assertions
1. Invalid drop locations are rejected
2. No function is created for invalid drops
3. Function list count remains unchanged
4. Error message is displayed if error messaging is implemented for invalid drops
5. Application state remains consistent
6. No database operations occur for invalid drops

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Invalid drop location (outside function list area)
- Drop on invalid UI elements (search bar, tab bar)
- Drop in wrong tab (Permissions, Database tabs)

Note: According to specifications, error message "Invalid drop location" should be displayed if brick is dropped outside function list area. If error messages are not shown for invalid drops, the test should verify that no function is created and the application state remains unchanged.

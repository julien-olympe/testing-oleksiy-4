# Add Brick Positive Test

## Test Name
Add Brick to Function - Successful Brick Addition

## Description
This test verifies that a user can successfully add a brick to the Function Editor by dragging it from the brick list to the central grid panel. The brick is positioned in a grid cell and becomes part of the function's logic.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Function Editor Display**
- Action: Wait for Function Editor to fully load
- Expected State: Function Editor displays with all components
- Assertions:
  - Verify settings icon is visible in top-right corner
  - Verify RUN button is visible above search bar
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side
  - Verify central grid panel is visible and empty (or with existing bricks)

**Step 2: Verify Available Bricks**
- Action: Verify brick list displays available bricks
- Expected State: Three bricks are available in brick list
- Assertions:
  - Verify "List instances by DB name" brick is visible in brick list
  - Verify "Get first instance" brick is visible in brick list
  - Verify "Log instance props" brick is visible in brick list

**Step 3: Add "List instances by DB name" Brick**
- Action: Drag "List instances by DB name" brick from brick list and drop it in the central grid panel
- Expected State: Brick is added to grid
- Assertions:
  - Wait for brick to appear in grid panel
  - Verify "List instances by DB name" brick is visible in grid panel
  - Verify brick displays input "Name of DB" and output "List"
  - Verify brick is positioned in a grid cell

**Step 4: Add "Get first instance" Brick**
- Action: Drag "Get first instance" brick from brick list and drop it in the central grid panel (different grid cell)
- Expected State: Second brick is added to grid
- Assertions:
  - Wait for brick to appear in grid panel
  - Verify "Get first instance" brick is visible in grid panel
  - Verify brick displays input "List" and output "DB"
  - Verify both bricks are visible in grid panel

**Step 5: Add "Log instance props" Brick**
- Action: Drag "Log instance props" brick from brick list and drop it in the central grid panel (different grid cell)
- Expected State: Third brick is added to grid
- Assertions:
  - Wait for brick to appear in grid panel
  - Verify "Log instance props" brick is visible in grid panel
  - Verify brick displays input "Object" and output "value"
  - Verify all three bricks are visible in grid panel

**Step 6: Verify Brick Positioning**
- Action: Verify bricks are positioned in grid cells
- Expected State: Bricks are properly positioned
- Assertions:
  - Verify each brick is positioned in a discrete grid cell
  - Verify bricks do not overlap
  - Verify grid layout is maintained

**Step 7: Verify Brick Persistence**
- Action: Refresh page or navigate away and back to Function Editor
- Expected State: Bricks persist after page refresh
- Assertions:
  - Verify all bricks still appear in grid panel after refresh
  - Verify brick positions are maintained
  - Verify brick configurations are persisted in database

## Expected Results
1. Brick list displays all three available bricks
2. Drag operation starts successfully for each brick
3. Drop operation in grid panel is accepted
4. Each brick is added to grid panel at grid cell position
5. Bricks display their inputs and outputs correctly
6. Bricks are positioned in discrete grid cells
7. Bricks are persisted in database
8. Bricks persist after page refresh

## Assertions
1. Function Editor displays all required components
2. Brick list displays all three required bricks
3. Drag-and-drop operation works correctly
4. Bricks are added to valid drop location (grid panel)
5. Bricks appear in grid panel with correct inputs and outputs
6. Bricks are positioned in grid cells
7. Bricks are persisted in database
8. Bricks remain visible after page refresh

## Error Scenarios
This is a positive test case. Error scenarios are covered in `add-brick-negative.md`.

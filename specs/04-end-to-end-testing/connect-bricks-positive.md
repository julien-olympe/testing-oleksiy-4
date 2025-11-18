# Connect Bricks Positive Test

## Test Name
Connect Bricks - Successful Connection

## Description
This test verifies that a user can successfully create a connection between two bricks by dragging a line from an output of one brick to an input of another brick. The connection defines data flow between bricks.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. At least two bricks are added to the grid panel:
   - "List instances by DB name" brick
   - "Get first instance" brick
6. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Function Editor Display**
- Action: Wait for Function Editor to fully load
- Expected State: Function Editor displays with bricks in grid panel
- Assertions:
  - Verify grid panel is visible
  - Verify "List instances by DB name" brick is visible in grid panel
  - Verify "Get first instance" brick is visible in grid panel
  - Verify bricks display their input and output ports

**Step 2: Verify Brick Ports are Visible**
- Action: Verify input and output ports are displayed on bricks
- Expected State: Brick ports are visible
- Assertions:
  - Verify "List instances by DB name" brick shows output "List"
  - Verify "Get first instance" brick shows input "List" and output "DB"
  - Verify ports are clickable or draggable

**Step 3: Connect "List instances by DB name" to "Get first instance"**
- Action: Click and drag from the "List" output port of "List instances by DB name" brick to the "List" input port of "Get first instance" brick
- Expected State: Connection line is created
- Assertions:
  - Wait for connection line to appear
  - Verify connection line is visible between "List" output and "List" input
  - Verify connection line is properly rendered
  - Verify connection line connects the correct ports

**Step 4: Add Third Brick and Connect**
- Action: Add "Log instance props" brick to grid panel (if not already present)
- Expected State: Third brick is added
- Assertions:
  - Verify "Log instance props" brick is visible in grid panel
  - Verify brick shows input "Object" and output "value"

**Step 5: Connect "Get first instance" to "Log instance props"**
- Action: Click and drag from the "DB" output port of "Get first instance" brick to the "Object" input port of "Log instance props" brick
- Expected State: Connection line is created
- Assertions:
  - Wait for connection line to appear
  - Verify connection line is visible between "DB" output and "Object" input
  - Verify both connection lines are visible in grid panel
  - Verify connection lines are properly rendered

**Step 6: Verify Connection Persistence**
- Action: Refresh page or navigate away and back to Function Editor
- Expected State: Connections persist after page refresh
- Assertions:
  - Verify all connection lines still appear after refresh
  - Verify connections are maintained between correct ports
  - Verify connections are persisted in database

**Step 7: Verify Connection Visual Feedback**
- Action: Verify connection lines update when bricks are moved (if brick movement is supported)
- Expected State: Connection lines maintain connections
- Assertions:
  - If bricks can be moved: Verify connection lines update position
  - Verify connection lines remain connected to correct ports

## Expected Results
1. Brick input and output ports are visible and accessible
2. Connection can be created by dragging from output to input
3. Connection line is displayed between connected ports
4. Connection line is properly rendered
5. Multiple connections can be created
6. Connections are persisted in database
7. Connections persist after page refresh
8. Connection lines maintain connections when bricks move (if supported)

## Assertions
1. Brick ports are visible and functional
2. Drag operation from output port works correctly
3. Drop operation on input port works correctly
4. Connection line is created and displayed
5. Connection line connects correct ports
6. Multiple connections can be created
7. Connections are persisted in database
8. Connections remain visible after page refresh

## Error Scenarios
This is a positive test case. Error scenarios are covered in `connect-bricks-negative.md`.

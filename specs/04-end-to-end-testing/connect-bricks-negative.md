# Connect Bricks Negative Test

## Test Name
Connect Bricks - Error Cases

## Description
This test verifies that the system properly handles error conditions when attempting to connect bricks. It tests incompatible output/input types, circular dependencies, and invalid connection attempts.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. Multiple bricks are added to the grid panel:
   - "List instances by DB name" brick
   - "Get first instance" brick
   - "Log instance props" brick
6. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Incompatible Output/Input Types

**Step 1.1: Verify Bricks are Available**
- Action: Verify bricks are displayed in grid panel
- Expected State: Bricks are visible with their ports
- Assertions:
  - Verify "List instances by DB name" brick shows output "List"
  - Verify "Log instance props" brick shows input "Object"

**Step 1.2: Attempt Invalid Connection**
- Action: Attempt to connect "List" output of "List instances by DB name" brick to "Object" input of "Log instance props" brick (if types are incompatible)
- Expected State: Connection is rejected
- Assertions:
  - Verify error message is displayed: "Output type does not match input type" (if type checking is implemented)
  - Verify no connection line is created
  - Verify connection attempt is rejected

**Note**: This test case depends on type checking implementation. If the system allows any output to connect to any input, this test may not apply.

### Test Case 2: Circular Dependency

**Step 2.1: Create Initial Connection**
- Action: Connect "List instances by DB name" output "List" to "Get first instance" input "List"
- Expected State: Connection is created
- Assertions:
  - Verify connection line is visible

**Step 2.2: Attempt Circular Connection**
- Action: Attempt to create a connection that would create a cycle (e.g., connect "Get first instance" output back to "List instances by DB name" input, if such input exists)
- Expected State: Connection is rejected
- Assertions:
  - Verify error message is displayed: "Circular connection not allowed"
  - Verify no circular connection is created
  - Verify existing connections remain intact

**Note**: This test case depends on circular dependency detection. If the system does not detect circular dependencies, this test may not apply.

### Test Case 3: Connect to Same Brick

**Step 3.1: Attempt Self-Connection**
- Action: Attempt to connect an output port to an input port on the same brick (if such connection is invalid)
- Expected State: Connection is rejected
- Assertions:
  - Verify error message is displayed (if self-connections are not allowed)
  - Verify no connection line is created
  - Verify connection attempt is rejected

**Note**: This test case depends on whether self-connections are allowed. If self-connections are valid, this test may not apply.

### Test Case 4: Connect to Already Connected Input

**Step 4.1: Create Initial Connection**
- Action: Connect "List instances by DB name" output "List" to "Get first instance" input "List"
- Expected State: Connection is created
- Assertions:
  - Verify connection line is visible

**Step 4.2: Attempt Duplicate Connection**
- Action: Attempt to connect another output to the same "List" input of "Get first instance" brick
- Expected State: Connection is rejected or replaces existing connection
- Assertions:
  - If rejected: Verify error message is displayed (if duplicate connections are not allowed)
  - If replaced: Verify old connection is removed and new connection is created
  - Verify behavior matches specification requirements

## Expected Results
1. Incompatible output/input types are rejected with appropriate error message
2. Circular connections are rejected with "Circular connection not allowed" message
3. Invalid connection attempts are rejected
4. Error messages are displayed and visible to user
5. No invalid connections are created
6. Existing valid connections remain intact

## Assertions
1. Error messages match specifications exactly:
   - "Output type does not match input type" for incompatible types
   - "Circular connection not allowed" for circular dependencies
2. No invalid connections are created
3. Error messages are user-friendly and actionable
4. Existing connections remain intact after error
5. No database operations occur for invalid connections

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Incompatible output/input types (if type checking is implemented)
- Circular dependency detection (if implemented)
- Self-connection handling (if applicable)
- Duplicate connection handling

Note: Some error scenarios may not apply if the system does not implement type checking or circular dependency detection. The test should verify the actual behavior matches specifications.

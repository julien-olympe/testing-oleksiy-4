# Execute Function Negative Test

## Test Name
Execute Function - Error Cases

## Description
This test verifies that the system properly handles error conditions when attempting to execute a function. It tests incomplete connections, missing configurations, and execution failure scenarios.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Brick Input Not Configured

**Step 1.1: Create Incomplete Function**
- Action: Add "List instances by DB name" brick to grid panel without configuring "Name of DB" input
- Expected State: Brick is added but not configured
- Assertions:
  - Verify "List instances by DB name" brick is visible
  - Verify "Name of DB" input is not configured (shows placeholder or is empty)

**Step 1.2: Attempt to Execute Function**
- Action: Click RUN button
- Expected State: Execution is rejected
- Assertions:
  - Verify error message is displayed: "Brick input not configured"
  - Verify execution does not start
  - Verify console does not show execution results

### Test Case 2: Brick Connections Incomplete

**Step 2.1: Create Function with Missing Connections**
- Action: Add bricks to grid panel:
  - "List instances by DB name" brick (configured with "default database")
  - "Get first instance" brick
  - Do NOT connect the bricks
- Expected State: Bricks are added but not connected
- Assertions:
  - Verify bricks are visible in grid panel
  - Verify no connection lines are visible

**Step 2.2: Attempt to Execute Function**
- Action: Click RUN button
- Expected State: Execution is rejected
- Assertions:
  - Verify error message is displayed: "Brick connections incomplete"
  - Verify execution does not start
  - Verify console does not show execution results

### Test Case 3: Disconnected Required Inputs

**Step 3.1: Create Function with Disconnected Input**
- Action: Add and connect bricks, but leave one required input disconnected:
  - "List instances by DB name" brick (configured)
  - "Get first instance" brick (input "List" not connected)
  - "Log instance props" brick
- Expected State: Function has disconnected required input
- Assertions:
  - Verify "Get first instance" input "List" is not connected

**Step 3.2: Attempt to Execute Function**
- Action: Click RUN button
- Expected State: Execution is rejected
- Assertions:
  - Verify error message is displayed: "Brick connections incomplete" or "Required input not connected"
  - Verify execution does not start

### Test Case 4: Execution Failure

**Step 4.1: Create Complete Function**
- Action: Create complete function with all bricks connected and configured
- Expected State: Function is ready for execution
- Assertions:
  - Verify all bricks are connected
  - Verify all required inputs are configured

**Step 4.2: Simulate Execution Failure**
- Action: Click RUN button (if database is unavailable or other runtime error occurs)
- Expected State: Execution fails
- Assertions:
  - Verify error message is displayed: "Execution failed"
  - Verify error message provides details about the failure
  - Verify console may show error information

**Note**: This test case may require specific test conditions to trigger execution failure (e.g., database unavailable, invalid data).

## Expected Results
1. Missing brick configuration is rejected with "Brick input not configured" message
2. Incomplete connections are rejected with "Brick connections incomplete" message
3. Disconnected required inputs are rejected with appropriate error message
4. Execution failures show "Execution failed" message
5. Error messages are displayed and visible to user
6. Execution does not proceed for error cases
7. Console does not show invalid execution results

## Assertions
1. Error messages match specifications exactly:
   - "Brick input not configured" for missing configuration
   - "Brick connections incomplete" for incomplete connections
   - "Execution failed" for execution failures
2. Execution does not start for error cases
3. Error messages are user-friendly and actionable
4. Function state remains consistent after errors
5. Console does not display invalid results

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Missing brick input configuration
- Incomplete brick connections
- Disconnected required inputs
- Execution failure handling

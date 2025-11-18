# Execute Function Positive Test

## Test Name
Execute Function - Successful Execution

## Description
This test verifies that a user can successfully execute a function by clicking the RUN button. The system validates all brick connections and configurations, then executes the logic defined by the connected bricks and displays results in the console.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. Function has complete brick configuration:
   - "List instances by DB name" brick with "Name of DB" configured to "default database"
   - "Get first instance" brick
   - "Log instance props" brick
   - All bricks are properly connected:
     - "List instances by DB name" output "List" → "Get first instance" input "List"
     - "Get first instance" output "DB" → "Log instance props" input "Object"
6. Project has at least one database instance in "default database" with a string property value
7. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Function Editor Display**
- Action: Wait for Function Editor to fully load
- Expected State: Function Editor displays with complete brick configuration
- Assertions:
  - Verify RUN button is visible above search bar on left side
  - Verify all three bricks are visible in grid panel
  - Verify all connection lines are visible
  - Verify "Name of DB" input is configured to "default database"

**Step 2: Verify Function is Ready for Execution**
- Action: Verify all required configurations are complete
- Expected State: Function is ready to execute
- Assertions:
  - Verify "List instances by DB name" brick has "Name of DB" configured
  - Verify "List instances by DB name" output "List" is connected to "Get first instance" input "List"
  - Verify "Get first instance" output "DB" is connected to "Log instance props" input "Object"
  - Verify RUN button is enabled and clickable

**Step 3: Click RUN Button**
- Action: Click the RUN button (located above search bar on left side)
- Expected State: Function execution starts
- Assertions:
  - Wait for execution to complete (may take a few seconds)
  - Verify execution completes without errors
  - Verify console area becomes visible or updates

**Step 4: Verify Console Output is Displayed**
- Action: Wait for console output to appear
- Expected State: Console displays execution results
- Assertions:
  - Verify console area is visible
  - Verify console contains output content
  - Verify console displays logged instance properties

**Step 5: Verify Console Output Content**
- Action: Read console output content
- Expected State: Console shows logged instance properties
- Assertions:
  - Verify console displays logged instance properties
  - Verify console shows property names and values
  - Verify console shows the string property value from the first database instance
  - Verify console output is readable and properly formatted

**Step 6: Verify Execution Completes Successfully**
- Action: Verify execution status
- Expected State: Execution completed successfully
- Assertions:
  - Verify no error messages are displayed
  - Verify RUN button is available for re-execution
  - Verify function can be executed again if needed

## Expected Results
1. RUN button is visible and clickable
2. Function execution starts when RUN button is clicked
3. Execution completes successfully without errors
4. Console area displays execution results
5. Console shows logged instance properties
6. Console displays property names and values correctly
7. Console shows string property value from first database instance
8. Function can be executed multiple times

## Assertions
1. RUN button is accessible and functional
2. Function execution is triggered correctly
3. All brick connections are validated
4. All brick configurations are validated
5. Execution completes successfully
6. Console output is displayed correctly
7. Console shows expected logged properties
8. Console output is readable and formatted correctly

## Error Scenarios
This is a positive test case. Error scenarios are covered in `execute-function-negative.md`.

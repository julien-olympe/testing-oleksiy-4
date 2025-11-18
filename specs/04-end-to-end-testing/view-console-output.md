# View Console Output Test

## Test Name
View Console Output

## Description
This test verifies that a user can view the execution results and logged values in the console after executing a function. The console displays all output from "Log instance props" bricks.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. Function has been executed successfully (produces console output)
6. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Execute Function**
- Action: Execute a function that produces console output (function with "Log instance props" brick)
- Expected State: Function executes successfully
- Assertions:
  - Verify function execution completes
  - Verify console area becomes visible or updates

**Step 2: Verify Console Area is Displayed**
- Action: Verify console area is visible
- Expected State: Console area is displayed
- Assertions:
  - Verify console area is visible in Function Editor
  - Verify console area is accessible and readable
  - Verify console area displays output content

**Step 3: Verify Console Output Content**
- Action: Read console output content
- Expected State: Console shows logged instance properties
- Assertions:
  - Verify console displays logged instance properties
  - Verify console shows property names and values
  - Verify console shows string property value from database instance
  - Verify console output is readable and properly formatted

**Step 4: Verify Console Output Format**
- Action: Verify console output formatting
- Expected State: Console output is properly formatted
- Assertions:
  - Verify property names are displayed clearly
  - Verify property values are displayed clearly
  - Verify output is organized and readable
  - Verify output format is consistent

**Step 5: Verify Multiple Executions**
- Action: Execute function again and verify console updates
- Expected State: Console shows new execution results
- Assertions:
  - Verify console updates with new execution results
  - Verify previous output may be cleared or appended (depending on implementation)
  - Verify console shows latest execution results

**Step 6: Verify Console Persistence**
- Action: Verify console output persists (if applicable)
- Expected State: Console output remains visible
- Assertions:
  - Verify console output remains visible after execution
  - Verify console output may persist until next execution or page refresh

## Expected Results
1. Console area is displayed after function execution
2. Console displays logged instance properties
3. Console shows property names and values correctly
4. Console shows string property value from database instance
5. Console output is readable and properly formatted
6. Console updates with new execution results
7. Console output is visible and accessible

## Assertions
1. Console area is visible and functional
2. Console displays execution results correctly
3. Console shows logged instance properties
4. Console shows property names and values
5. Console output is properly formatted
6. Console updates correctly for multiple executions
7. Console output is readable and accessible

## Error Scenarios
This is a positive test case. However, potential issues to verify:
- If execution fails, console may show error messages
- If no output is generated, console may be empty or show appropriate message
- If console fails to display, appropriate error should be handled

### Test Case: Console with No Output

**Step E.1: Execute Function with No Log Output**
- Action: Execute a function that does not include "Log instance props" brick
- Expected State: Function executes but produces no console output
- Assertions:
  - Verify console area is visible (may be empty)
  - Verify console shows no output or appropriate message
  - Verify console state is consistent

### Test Case: Console with Error Output

**Step E.2: Execute Function with Error**
- Action: Execute a function that produces an error
- Expected State: Console shows error information
- Assertions:
  - Verify console displays error messages (if errors are logged to console)
  - Verify error information is readable
  - Verify console state is consistent

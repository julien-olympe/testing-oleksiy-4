# Rename Function Negative Test

## Test Name
Rename Function - Error Cases

## Description
This test verifies that the function rename system properly handles invalid inputs and error conditions. It tests empty name validation, duplicate name detection, and rename failure scenarios.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Project tab is active)
5. Two test functions exist in the project's function list:
   - Function A with name "Existing Function A"
   - Function B with name "Existing Function B" (to be renamed)
6. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Empty Function Name

**Step 1.1: Select Function for Rename**
- Action: Select Function B and access rename interface
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible and editable

**Step 1.2: Clear Function Name**
- Action: Clear the function name field (delete all characters)
- Expected State: Function name field is empty
- Assertions:
  - Verify input field is empty

**Step 1.3: Attempt to Confirm Empty Name**
- Action: Attempt to confirm rename with empty name (press Enter or click confirm)
- Expected State: Rename is rejected
- Assertions:
  - Verify error message is displayed: "Function name cannot be empty"
  - Verify function name remains unchanged (still shows "Existing Function B")
  - Verify rename interface remains open or closes with error

### Test Case 2: Duplicate Function Name

**Step 2.1: Select Function for Rename**
- Action: Select Function B and access rename interface
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible

**Step 2.2: Enter Duplicate Name**
- Action: Enter function name: `Existing Function A` (same as Function A)
- Expected State: Function name field contains duplicate name
- Assertions:
  - Verify input field contains "Existing Function A"

**Step 2.3: Attempt to Confirm Duplicate Name**
- Action: Confirm rename with duplicate name
- Expected State: Rename is rejected
- Assertions:
  - Verify error message is displayed: "Function name already exists"
  - Verify function name remains unchanged (still shows "Existing Function B")
  - Verify rename interface closes or remains open with error

### Test Case 3: Whitespace-Only Name

**Step 3.1: Select Function for Rename**
- Action: Select Function B and access rename interface
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible

**Step 3.2: Enter Whitespace-Only Name**
- Action: Enter only whitespace characters: `   ` (spaces)
- Expected State: Function name field contains whitespace
- Assertions:
  - Verify input field contains whitespace

**Step 3.3: Attempt to Confirm Whitespace Name**
- Action: Confirm rename with whitespace-only name
- Expected State: Rename is rejected (should be treated as empty)
- Assertions:
  - Verify error message is displayed: "Function name cannot be empty" or validation error
  - Verify function name remains unchanged

## Expected Results
1. Empty function name is rejected with "Function name cannot be empty" message
2. Duplicate function name is rejected with "Function name already exists" message
3. Whitespace-only name is rejected (treated as empty)
4. Function name remains unchanged for all error cases
5. Error messages are displayed and visible to user
6. Function list remains in consistent state

## Assertions
1. Error messages match specifications exactly:
   - "Function name cannot be empty" for empty name
   - "Function name already exists" for duplicate name
2. Function name is not updated for any error case
3. Error messages are user-friendly and actionable
4. Function list remains unchanged after errors
5. No database updates occur for error cases

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Empty function name validation
- Duplicate function name detection
- Whitespace-only name validation (treated as empty)

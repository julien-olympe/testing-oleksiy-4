# Rename Project Negative Test

## Test Name
Rename Project - Error Cases

## Description
This test verifies that the project rename system properly handles invalid inputs and error conditions. It tests empty name validation, duplicate name detection, and rename failure scenarios.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated (on Home Screen)
4. Two test projects exist in the user's project list:
   - Project A with name "Existing Project A"
   - Project B with name "Existing Project B" (to be renamed)
5. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Empty Project Name

**Step 1.1: Select Project for Rename**
- Action: Select Project B and access rename interface
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible and editable

**Step 1.2: Clear Project Name**
- Action: Clear the project name field (delete all characters)
- Expected State: Project name field is empty
- Assertions:
  - Verify input field is empty

**Step 1.3: Attempt to Confirm Empty Name**
- Action: Attempt to confirm rename with empty name (press Enter or click confirm)
- Expected State: Rename is rejected
- Assertions:
  - Verify error message is displayed: "Project name cannot be empty"
  - Verify project name remains unchanged (still shows "Existing Project B")
  - Verify rename interface remains open or closes with error

### Test Case 2: Duplicate Project Name

**Step 2.1: Select Project for Rename**
- Action: Select Project B and access rename interface
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible

**Step 2.2: Enter Duplicate Name**
- Action: Enter project name: `Existing Project A` (same as Project A)
- Expected State: Project name field contains duplicate name
- Assertions:
  - Verify input field contains "Existing Project A"

**Step 2.3: Attempt to Confirm Duplicate Name**
- Action: Confirm rename with duplicate name
- Expected State: Rename is rejected
- Assertions:
  - Verify error message is displayed: "Project name already exists"
  - Verify project name remains unchanged (still shows "Existing Project B")
  - Verify rename interface closes or remains open with error

### Test Case 3: Whitespace-Only Name

**Step 3.1: Select Project for Rename**
- Action: Select Project B and access rename interface
- Expected State: Rename interface is displayed
- Assertions:
  - Verify rename input field is visible

**Step 3.2: Enter Whitespace-Only Name**
- Action: Enter only whitespace characters: `   ` (spaces)
- Expected State: Project name field contains whitespace
- Assertions:
  - Verify input field contains whitespace

**Step 3.3: Attempt to Confirm Whitespace Name**
- Action: Confirm rename with whitespace-only name
- Expected State: Rename is rejected (should be treated as empty)
- Assertions:
  - Verify error message is displayed: "Project name cannot be empty" or validation error
  - Verify project name remains unchanged

## Expected Results
1. Empty project name is rejected with "Project name cannot be empty" message
2. Duplicate project name is rejected with "Project name already exists" message
3. Whitespace-only name is rejected (treated as empty)
4. Project name remains unchanged for all error cases
5. Error messages are displayed and visible to user
6. Project list remains in consistent state

## Assertions
1. Error messages match specifications exactly:
   - "Project name cannot be empty" for empty name
   - "Project name already exists" for duplicate name
2. Project name is not updated for any error case
3. Error messages are user-friendly and actionable
4. Project list remains unchanged after errors
5. No database updates occur for error cases

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Empty project name validation
- Duplicate project name detection
- Whitespace-only name validation (treated as empty)

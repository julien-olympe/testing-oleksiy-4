# Create Database Instance Negative Test

## Test Name
Create Database Instance - Error Cases

## Description
This test verifies that the system properly handles error conditions when attempting to create database instances. It tests missing string property value and instance creation failure scenarios.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Database tab is active)
5. "default database" is selected in database list
6. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Empty String Property Value

**Step 1.1: Click Create Instance Button**
- Action: Click "Create instance" button
- Expected State: Create instance interface is displayed
- Assertions:
  - Verify create instance interface is displayed
  - Verify string property input field is visible

**Step 1.2: Leave String Property Empty**
- Action: Do not enter string value, or clear string input field
- Expected State: String input is empty
- Assertions:
  - Verify string input field is empty

**Step 1.3: Attempt to Create Instance**
- Action: Click "Create" or "Confirm" button with empty string value
- Expected State: Instance creation is rejected
- Assertions:
  - Verify error message is displayed: "String property value required"
  - Verify no instance is created
  - Verify instance list remains unchanged
  - Verify create instance interface may remain open or close with error

### Test Case 2: Whitespace-Only String Value

**Step 2.1: Click Create Instance Button**
- Action: Click "Create instance" button
- Expected State: Create instance interface is displayed
- Assertions:
  - Verify create instance interface is displayed

**Step 2.2: Enter Whitespace-Only Value**
- Action: Enter only whitespace characters: `   ` (spaces)
- Expected State: String input contains whitespace
- Assertions:
  - Verify string input field contains whitespace

**Step 2.3: Attempt to Create Instance**
- Action: Click "Create" or "Confirm" button with whitespace-only value
- Expected State: Instance creation may be rejected (treated as empty) or accepted
- Assertions:
  - If rejected: Verify error message is displayed: "String property value required"
  - If accepted: Verify instance is created with whitespace value
  - Verify behavior matches specification requirements

### Test Case 3: Cancel Instance Creation

**Step 3.1: Click Create Instance Button**
- Action: Click "Create instance" button
- Expected State: Create instance interface is displayed
- Assertions:
  - Verify create instance interface is displayed

**Step 3.2: Enter String Value**
- Action: Enter string value: `Test Value`
- Expected State: String input contains entered value
- Assertions:
  - Verify string input field contains entered value

**Step 3.3: Cancel Instance Creation**
- Action: Click "Cancel" button (if available)
- Expected State: Instance creation is cancelled
- Assertions:
  - Verify create instance interface is closed
  - Verify no instance is created
  - Verify instance list remains unchanged

## Expected Results
1. Empty string property value is rejected with "String property value required" message
2. Whitespace-only value may be rejected or accepted (depending on specification)
3. Instance creation can be cancelled
4. No instance is created for error cases
5. Error messages are displayed and visible to user
6. Instance list remains unchanged for error cases

## Assertions
1. Error messages match specifications exactly:
   - "String property value required" for empty value
2. No instance is created for error cases
3. Error messages are user-friendly and actionable
4. Instance list remains unchanged after errors
5. No database operations occur for error cases

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Empty string property value validation
- Whitespace-only value handling (may be treated as empty)
- Cancellation of instance creation

Note: According to specifications, error message "String property value required" should be displayed if string value is not provided. The test should verify this behavior.

# Create Database Instance Positive Test

## Test Name
Create Database Instance - Successful Instance Creation

## Description
This test verifies that a user can successfully create a new instance of a database and set the string property value. The instance is stored in the database and displayed in the instance list.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Project Editor for a test project (Database tab is active)
5. "default database" is selected in database list
6. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Database Tab Display**
- Action: Wait for Database tab to fully load
- Expected State: Database tab displays with database list and instance list
- Assertions:
  - Verify database list is visible on left side
  - Verify instance list area is visible on right side
  - Verify "default database" is selected
  - Verify "Create instance" button is visible

**Step 2: Click Create Instance Button**
- Action: Click "Create instance" button
- Expected State: Create instance interface is displayed
- Assertions:
  - Verify create instance interface is displayed (modal, form, or inline form)
  - Verify string property input field is visible
  - Verify "Create" or "Confirm" button is visible
  - Verify "Cancel" button is visible (if applicable)

**Step 3: Enter String Property Value**
- Action: Enter string value: `Test Instance Value ${timestamp}`
- Expected State: String input contains entered value
- Assertions:
  - Verify string input field contains entered value
  - Verify input field is editable

**Step 4: Create Instance**
- Action: Click "Create" or "Confirm" button
- Expected State: Instance is created
- Assertions:
  - Wait for instance to appear in instance list
  - Verify create instance interface is closed
  - Verify instance is created

**Step 5: Verify Instance in List**
- Action: Verify new instance appears in instance list
- Expected State: Instance is displayed in instance list
- Assertions:
  - Verify new instance appears in instance list on right side
  - Verify instance displays string property value "Test Instance Value ${timestamp}"
  - Verify instance ID or identifier is displayed (if applicable)
  - Verify instance is visible and properly formatted

**Step 6: Verify Instance Persistence**
- Action: Refresh page or switch tabs and return to Database tab
- Expected State: Created instance persists
- Assertions:
  - Verify instance still appears in instance list after refresh
  - Verify string property value is unchanged
  - Verify instance is persisted in database

**Step 7: Create Additional Instances**
- Action: Repeat steps 2-6 to create 2-3 more instances with different string values
- Expected State: Multiple instances are created
- Assertions:
  - Verify all instances appear in instance list
  - Verify each instance displays its string property value correctly
  - Verify instance list shows all created instances

## Expected Results
1. "Create instance" button is visible and clickable
2. Create instance interface is displayed correctly
3. String property input accepts value
4. Instance creation succeeds
5. New instance appears in instance list immediately
6. Instance displays string property value correctly
7. Instance is persisted in database
8. Instance persists after page refresh
9. Multiple instances can be created

## Assertions
1. "Create instance" button is accessible and functional
2. Create instance interface is displayed correctly
3. String property input field accepts and validates input
4. Instance creation succeeds
5. Instance appears in instance list
6. Instance displays string property value correctly
7. Instance is created in database
8. Instance persists after page refresh
9. Instance is associated with selected database and project

## Error Scenarios
This is a positive test case. Error scenarios are covered in `create-database-instance-negative.md`.

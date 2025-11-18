# Configure Brick Input Negative Test

## Test Name
Configure Brick Input - Error Cases

## Description
This test verifies that the system properly handles error conditions when attempting to configure brick inputs. It tests invalid database selection and configuration failure scenarios.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. "List instances by DB name" brick is added to the grid panel
6. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Database Not Found (If Applicable)

**Step 1.1: Click on "Name of DB" Input**
- Action: Click on the "Name of DB" input of the "List instances by DB name" brick
- Expected State: Database selection dropdown is displayed
- Assertions:
  - Verify dropdown is displayed

**Step 1.2: Attempt Invalid Selection**
- Action: If dropdown allows manual input or if a database is deleted while dropdown is open, attempt to select a non-existent database
- Expected State: Configuration is rejected
- Assertions:
  - Verify error message is displayed: "Database not found" (if applicable)
  - Verify configuration is not applied
  - Verify input remains unconfigured or shows previous value

**Note**: This test case may not apply if dropdown only shows existing databases and does not allow manual input.

### Test Case 2: Configuration Failure

**Step 2.1: Click on "Name of DB" Input**
- Action: Click on the "Name of DB" input
- Expected State: Database selection dropdown is displayed
- Assertions:
  - Verify dropdown is displayed

**Step 2.2: Select Database**
- Action: Select "default database" from dropdown
- Expected State: Configuration should be applied
- Assertions:
  - If configuration fails: Verify error message is displayed: "Configuration failed"
  - Verify configuration is not applied if error occurs
  - Verify input state is consistent

**Note**: This test case simulates a database operation failure. It may require specific test conditions to trigger.

## Expected Results
1. Invalid database selection is rejected with appropriate error message
2. Configuration failure shows "Configuration failed" message
3. Error messages are displayed and visible to user
4. Configuration is not applied for error cases
5. Input state remains consistent after errors

## Assertions
1. Error messages match specifications exactly:
   - "Database not found" for non-existent database (if applicable)
   - "Configuration failed" for configuration failures
2. Configuration is not applied for error cases
3. Error messages are user-friendly and actionable
4. Input state remains consistent after errors
5. No invalid configurations are saved to database

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Invalid database selection (if applicable)
- Configuration failure handling

Note: Some error scenarios may not be easily testable without specific test conditions or error injection. The test should verify the actual behavior matches specifications when errors occur.

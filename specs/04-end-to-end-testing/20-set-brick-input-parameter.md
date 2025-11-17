# Set Brick Input Parameter Test Scenarios

## Test ID: BRICK-PARAM-001
## Test Name: Set Brick Input Parameter - Positive Case
## Test Type: Positive
## Related Use Cases: Set Brick Input Parameter

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "default database" type exists in the system
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Brick: "List instances by DB name"
- Input Parameter: "Name of DB"
- Parameter Value: "default database"

### Test Steps
1. Verify user is in Function Editor
2. Verify "List instances by DB name" brick is displayed on canvas
3. Verify brick displays input connection point "Name of DB"
4. Click on the input parameter "Name of DB" on the "List instances by DB name" brick
5. Verify a dropdown or selection interface is displayed
6. Verify available databases are listed (including "default database")
7. Verify "default database" is visible in the list
8. Select "default database" from the list
9. Verify "default database" is set as the value for the "Name of DB" input parameter
10. Verify the parameter value is displayed on the brick
11. Verify the parameter configuration is automatically persisted
12. Verify no error messages are displayed

### Expected Results
- Input parameter is clickable
- Selection interface is displayed when parameter is clicked
- Available databases are listed
- "default database" is selectable
- Parameter value is set successfully
- Parameter value is displayed on brick
- Parameter configuration is persisted automatically
- No error messages are displayed

### Postconditions
- "Name of DB" input parameter is set to "default database"
- Parameter value is displayed on brick
- Parameter configuration is persisted in function definition
- User remains in Function Editor
- Parameter can be changed or cleared

---

## Test ID: BRICK-PARAM-002
## Test Name: Set Brick Input Parameter - Negative Case - Invalid Parameter Value
## Test Type: Negative
## Related Use Cases: Set Brick Input Parameter

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- System validates parameter values
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Brick: "List instances by DB name"
- Input Parameter: "Name of DB"
- Invalid Parameter Value: Value that is not a valid database name (if direct input is allowed)

### Test Steps
1. Verify user is in Function Editor
2. Verify "List instances by DB name" brick is displayed on canvas
3. Click on the input parameter "Name of DB"
4. If direct input is allowed, attempt to enter invalid database name
5. If selection interface is used, verify only valid options are available
6. Verify invalid value is rejected OR validation prevents setting invalid value
7. Verify error message "Invalid parameter value" is displayed (if invalid value is attempted)
8. Verify parameter value is not set or invalid value is cleared
9. Verify parameter remains unset or retains previous valid value

### Expected Results
- Parameter interface is accessible
- Invalid values are rejected
- Error message "Invalid parameter value" is displayed (if invalid value is attempted)
- Parameter value is not set to invalid value
- Validation works correctly

### Postconditions
- Parameter value is not set to invalid value
- Parameter remains unset or retains valid value
- User remains in Function Editor
- User can set valid parameter value

---

## Test ID: BRICK-PARAM-003
## Test Name: Set Brick Input Parameter - Change Parameter Value
## Test Type: Positive
## Related Use Cases: Set Brick Input Parameter

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Name of DB" input parameter is already set to "default database"
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Brick: "List instances by DB name"
- Input Parameter: "Name of DB"
- Current Value: "default database"
- New Value: "default database" (same value, or different if multiple databases exist)

### Test Steps
1. Verify user is in Function Editor
2. Verify "List instances by DB name" brick is displayed on canvas
3. Verify "Name of DB" parameter shows current value "default database"
4. Click on the input parameter "Name of DB" again
5. Verify selection interface is displayed
6. Verify current value "default database" is selected or highlighted
7. Select "default database" again (or select different value if multiple databases exist)
8. Verify parameter value is updated
9. Verify updated value is displayed on brick
10. Verify parameter configuration is persisted
11. Verify no error messages are displayed

### Expected Results
- Parameter can be changed
- Selection interface is accessible
- Parameter value is updated successfully
- Updated value is displayed on brick
- Parameter configuration is persisted
- No error messages are displayed

### Postconditions
- Parameter value is updated
- Updated value is displayed on brick
- Parameter configuration is persisted
- User remains in Function Editor
- Parameter can be changed again if needed

---

## Test ID: BRICK-PARAM-004
## Test Name: Set Brick Input Parameter - Clear Parameter Value
## Test Type: Positive (Edge Case)
## Related Use Cases: Set Brick Input Parameter

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Name of DB" input parameter is set to "default database"
- User has permission to edit the function
- System allows clearing parameter values (if applicable)

### Test Data
- Function Name: "TestFunction"
- Brick: "List instances by DB name"
- Input Parameter: "Name of DB"
- Current Value: "default database"

### Test Steps
1. Verify user is in Function Editor
2. Verify "List instances by DB name" brick is displayed on canvas
3. Verify "Name of DB" parameter shows value "default database"
4. Click on the input parameter "Name of DB"
5. Verify selection interface is displayed
6. Clear the parameter value (select "None" or clear option, if available)
7. Verify parameter value is cleared
8. Verify parameter no longer displays a value (or displays as unset)
9. Verify parameter configuration is persisted
10. Verify no error messages are displayed

### Expected Results
- Parameter can be cleared (if system supports it)
- Clearing action works correctly
- Parameter value is removed
- Parameter displays as unset
- Parameter configuration is persisted
- No error messages are displayed

### Postconditions
- Parameter value is cleared
- Parameter is displayed as unset
- Parameter configuration is persisted
- User remains in Function Editor
- Parameter can be set again if needed

---

## Test ID: BRICK-PARAM-005
## Test Name: Set Brick Input Parameter - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Set Brick Input Parameter

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Function "SharedFunction" exists in project "SharedProject"
- "List instances by DB name" brick exists on canvas
- User "user@example.com" has permission to view the function but NOT to edit it
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Function Editor for function "SharedFunction"

### Test Data
- Function Name: "SharedFunction"
- Project Name: "SharedProject"
- Brick: "List instances by DB name"
- Input Parameter: "Name of DB"

### Test Steps
1. Verify user "user@example.com" is in Function Editor
2. Verify "List instances by DB name" brick is displayed on canvas (if user has view permission)
3. Attempt to click on the input parameter "Name of DB"
4. Verify parameter is not editable OR edit fails
5. Verify error message "Permission denied" is displayed (if edit is attempted)
6. Verify parameter value is not changed
7. Verify no changes are persisted

### Expected Results
- Brick is visible (if user has view permission)
- Parameter is not editable OR edit fails
- Error message "Permission denied" is displayed (if edit is attempted)
- Parameter value remains unchanged
- Permission restrictions are enforced

### Postconditions
- Parameter value remains unchanged
- No changes are persisted
- User "user@example.com" remains in Function Editor
- Permission restrictions are maintained

---

## Test ID: BRICK-PARAM-006
## Test Name: Set Brick Input Parameter - Verify Parameter Persistence
## Test Type: Positive (Verification)
## Related Use Cases: Set Brick Input Parameter

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- User has permission to edit the function

### Test Data
- Function Name: "TestFunction"
- Brick: "List instances by DB name"
- Input Parameter: "Name of DB"
- Parameter Value: "default database"

### Test Steps
1. Verify user is in Function Editor
2. Verify "List instances by DB name" brick is displayed on canvas
3. Click on input parameter "Name of DB"
4. Select "default database" from the list
5. Verify parameter value is set to "default database"
6. Navigate away from Function Editor (close editor or navigate to Project Editor)
7. Navigate back to Function Editor (double-click function "TestFunction")
8. Verify Function Editor opens
9. Verify "List instances by DB name" brick is still displayed on canvas
10. Verify "Name of DB" parameter still shows value "default database"
11. Verify parameter configuration is persisted

### Expected Results
- Parameter is set successfully
- After navigation away and back, parameter value still exists
- Parameter value is displayed after returning
- Parameter configuration is persisted in the system

### Postconditions
- Parameter value is persisted
- Parameter value is displayed after navigation
- User is in Function Editor
- Parameter is accessible

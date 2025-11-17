# Edit Database Instance Property Test Scenarios

## Test ID: DB-INSTANCE-EDIT-001
## Test Name: Edit Database Instance Property - Positive Case
## Test Type: Positive
## Related Use Cases: Edit Database Instance Property

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- Database instance exists for "default database" in project "TestProject"
- Instance has empty or existing string property value
- Database tab is active in Project Editor
- "default database" is selected
- User has permission to edit database instances

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"
- New Property Value: "Updated Instance Value"

### Test Steps
1. Verify user is in Project Editor with Database tab active
2. Verify "default database" is selected
3. Verify database instance is displayed in instances list
4. Locate the string property input field for the instance
5. Click on the string property input field
6. Clear existing value (if any)
7. Type "Updated Instance Value" in the input field
8. Verify value is entered in the input field
9. Verify value is automatically saved (no save button click required)
10. Verify value change is persisted
11. Verify no error messages are displayed
12. Verify auto-save occurs immediately after input (or after brief delay)

### Expected Results
- Input field is clickable and editable
- User can enter new value
- Value is displayed in input field
- Auto-save functionality works (no manual save required)
- Value change is persisted automatically
- No error messages are displayed
- Changes are saved without explicit save action

### Postconditions
- Database instance property value is updated to "Updated Instance Value"
- Updated value is persisted in the system
- Updated value is displayed in the input field
- User remains in Project Editor
- Instance data is saved

---

## Test ID: DB-INSTANCE-EDIT-002
## Test Name: Edit Database Instance Property - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Edit Database Instance Property

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Database instance exists for "default database" in project "SharedProject"
- User "user@example.com" has permission to view the project but NOT to edit database instances
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Project Editor for project "SharedProject"
- Database tab is active in Project Editor
- "default database" is selected

### Test Data
- Project Name: "SharedProject"
- Database Type: "default database"
- Attempted Property Value: "Unauthorized Edit"

### Test Steps
1. Verify user "user@example.com" is in Project Editor with Database tab active
2. Verify database instance is displayed in instances list (if user has view permission)
3. Locate the string property input field for the instance
4. Attempt to click on the input field
5. Verify input field is disabled OR edit fails
6. If edit is attempted, verify error message "Permission denied" is displayed
7. Verify property value is not changed
8. Verify no changes are persisted

### Expected Results
- Instance is visible to user (if user has view permission)
- Input field is disabled OR edit fails when attempted
- Error message "Permission denied" is displayed (if edit is attempted)
- Property value remains unchanged
- No changes are persisted
- Permission restrictions are enforced

### Postconditions
- Property value remains unchanged
- No changes are persisted
- User "user@example.com" remains in Project Editor
- Permission restrictions are maintained

---

## Test ID: DB-INSTANCE-EDIT-003
## Test Name: Edit Database Instance Property - Negative Case - Invalid Property Value
## Test Type: Negative
## Related Use Cases: Edit Database Instance Property

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Database instance exists for "default database" in project "TestProject"
- Database tab is active in Project Editor
- "default database" is selected
- System has validation rules for property values (if applicable)

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"
- Invalid Property Value: Value that violates validation rules (if system has validation)

### Test Steps
1. Verify user is in Project Editor with Database tab active
2. Verify database instance is displayed in instances list
3. Locate the string property input field for the instance
4. Click on the string property input field
5. Enter invalid property value (if validation rules exist)
6. Attempt to save or move focus away from input field
7. Verify validation prevents save OR error is displayed
8. Verify error message "Invalid property value" is displayed
9. Verify property value is not saved
10. Verify original value is restored or invalid value is rejected

### Expected Results
- Input field accepts input
- Invalid value is detected by validation
- Error message "Invalid property value" is displayed
- Property value is not saved
- Original value is maintained or invalid value is rejected
- Validation works correctly

### Postconditions
- Property value remains unchanged or invalid value is rejected
- No invalid changes are persisted
- User remains in Project Editor
- User can correct the value and try again

---

## Test ID: DB-INSTANCE-EDIT-004
## Test Name: Edit Database Instance Property - Verify Auto-Save Functionality
## Test Type: Positive (Verification)
## Related Use Cases: Edit Database Instance Property

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Database instance exists for "default database" in project "TestProject"
- Instance has existing string property value "Original Value"
- Database tab is active in Project Editor
- "default database" is selected

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"
- Original Property Value: "Original Value"
- New Property Value: "Auto-Saved Value"

### Test Steps
1. Verify user is in Project Editor with Database tab active
2. Verify database instance is displayed with property value "Original Value"
3. Click on the string property input field
4. Clear existing value
5. Type "Auto-Saved Value" in the input field
6. Verify value is entered
7. Wait for auto-save to occur (or move focus away from input field)
8. Verify no save button click is required
9. Navigate away from Database tab (click Project tab)
10. Navigate back to Database tab
11. Verify "default database" is selected
12. Verify instance property value is "Auto-Saved Value"
13. Verify value was automatically saved and persisted

### Expected Results
- Input field accepts new value
- Auto-save occurs without manual save action
- Value is persisted automatically
- After navigation away and back, value is still "Auto-Saved Value"
- Auto-save functionality works correctly

### Postconditions
- Property value is updated to "Auto-Saved Value"
- Value is persisted automatically
- User remains in Project Editor
- Auto-save functionality is confirmed

---

## Test ID: DB-INSTANCE-EDIT-005
## Test Name: Edit Database Instance Property - Edit Multiple Instances
## Test Type: Positive
## Related Use Cases: Edit Database Instance Property

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Multiple database instances exist for "default database" in project "TestProject"
- Database tab is active in Project Editor
- "default database" is selected

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"
- Instance 1 New Value: "First Instance Value"
- Instance 2 New Value: "Second Instance Value"

### Test Steps
1. Verify user is in Project Editor with Database tab active
2. Verify multiple instances are displayed in instances list
3. Locate first instance's string property input field
4. Click on the input field
5. Type "First Instance Value"
6. Verify value is auto-saved
7. Locate second instance's string property input field
8. Click on the input field
9. Type "Second Instance Value"
10. Verify value is auto-saved
11. Verify both instances have their respective values
12. Verify both values are persisted
13. Verify no error messages are displayed

### Expected Results
- Multiple instances can be edited independently
- Each instance's property can be edited separately
- Values are saved correctly for each instance
- No conflicts occur between instances
- All values are persisted correctly

### Postconditions
- First instance has value "First Instance Value"
- Second instance has value "Second Instance Value"
- Both values are persisted
- User remains in Project Editor
- All instances are accessible

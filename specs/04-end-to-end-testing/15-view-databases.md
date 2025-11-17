# View Databases Test Scenarios

## Test ID: DB-VIEW-001
## Test Name: View Databases - Positive Case
## Test Type: Positive
## Related Use Cases: View Databases

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to access the project
- "default database" type exists in the system with a string property

### Test Data
- Project Name: "TestProject"

### Test Steps
1. Verify user is in Project Editor
2. Verify Project tab is active by default
3. Click Database tab in the header
4. Verify Database tab is now active
5. Verify left side panel brick list is hidden
6. Verify left side displays database type list
7. Verify "default database" is displayed in the database type list
8. Verify "default database" is selectable/clickable
9. Verify database type list is clearly visible
10. Verify no error messages are displayed

### Expected Results
- Database tab is clickable and functional
- Database tab becomes active when clicked
- Brick list is hidden in Database tab
- Database type list is displayed on the left side
- "default database" is visible in the list
- Database types are clearly displayed
- No error messages are displayed

### Postconditions
- Database tab is active
- Database type list is displayed
- "default database" is visible
- User remains in Project Editor
- User can view and select database types

---

## Test ID: DB-VIEW-002
## Test Name: View Databases - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: View Databases

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "PrivateProject" exists and belongs to "owner@example.com"
- User "user@example.com" does NOT have permission to access "PrivateProject"
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is on Home Screen
- Project "PrivateProject" is NOT visible to "user@example.com"

### Test Data
- User Email: "user@example.com"
- Project Name: "PrivateProject"

### Test Steps
1. Verify user "user@example.com" is on Home Screen
2. Verify project "PrivateProject" is NOT displayed in the project list (user has no permission)
3. If project is somehow accessible, attempt to open Project Editor for "PrivateProject"
4. If Project Editor is opened, attempt to click Database tab
5. Verify access is denied OR Database tab is not accessible
6. Verify error message "Permission denied" is displayed
7. Verify user cannot view databases

### Expected Results
- Project is not visible to unauthorized user OR access is denied
- Database tab is not accessible
- Error message "Permission denied" is displayed (if access is attempted)
- User cannot view databases without proper access
- Permission restrictions are enforced

### Postconditions
- User cannot view databases
- User remains on Home Screen or is denied access
- Permission restrictions are maintained

---

## Test ID: DB-VIEW-003
## Test Name: View Databases - Verify Database Type Properties
## Test Type: Positive (Verification)
## Related Use Cases: View Databases

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- "default database" type exists in the system with a string property

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"
- Property: string property

### Test Steps
1. Verify user is in Project Editor
2. Click Database tab in the header
3. Verify Database tab is now active
4. Verify "default database" is displayed in the database type list
5. Select "default database" (click on it)
6. Verify "default database" is selected
7. Verify right side displays database instances list for "default database"
8. Verify database type information is accessible (if displayed)
9. Verify string property is associated with "default database" (if property information is visible)

### Expected Results
- Database tab is accessible
- "default database" is visible and selectable
- Database type can be selected
- Instances list is displayed for selected database type
- Database type information is accessible
- Properties are associated with database type

### Postconditions
- Database tab is active
- "default database" is selected
- Instances list is displayed
- User remains in Project Editor
- User can create instances for the selected database type

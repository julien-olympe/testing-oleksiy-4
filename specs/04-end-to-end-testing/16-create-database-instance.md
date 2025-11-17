# Create Database Instance Test Scenarios

## Test ID: DB-INSTANCE-CREATE-001
## Test Name: Create Database Instance - Positive Case
## Test Type: Positive
## Related Use Cases: Create Database Instance

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to create database instances
- Database tab is active in Project Editor
- "default database" type exists in the system with a string property
- "default database" is selected in the database type list

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"

### Test Steps
1. Verify user is in Project Editor with Database tab active
2. Verify "default database" is selected in the database type list on the left
3. Verify right side displays database instances list (may be empty)
4. Verify "Create instance" button is displayed
5. Click "Create instance" button
6. Verify a new database instance is created
7. Verify the instance is added to the instances list immediately
8. Verify the instance displays an input field for the string property
9. Verify the instance is assigned to the current project "TestProject"
10. Verify the instance is assigned to "default database" type
11. Verify no error messages are displayed

### Expected Results
- Database tab is displayed correctly
- "Create instance" button is clickable
- New instance is created successfully
- Instance appears in instances list immediately
- Instance has input field for string property
- Instance is assigned to correct project and database type
- Instance is persisted in the system
- No error messages are displayed

### Postconditions
- New database instance exists in project "TestProject"
- Instance is displayed in instances list
- Instance has empty string property (not yet filled)
- User remains in Project Editor
- Instance can be edited or deleted

---

## Test ID: DB-INSTANCE-CREATE-002
## Test Name: Create Database Instance - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Create Database Instance

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- User "user@example.com" has permission to view the project but NOT to create database instances
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Project Editor for project "SharedProject"
- Database tab is active in Project Editor

### Test Data
- Project Name: "SharedProject"
- Database Type: "default database"

### Test Steps
1. Verify user "user@example.com" is in Project Editor with Database tab active
2. Verify "default database" is selected
3. Verify "Create instance" button is NOT displayed OR is disabled (if user lacks permission)
4. If "Create instance" button is visible, attempt to click it
5. If button is clicked, verify action fails
6. Verify error message "Permission denied" is displayed (if action is attempted)
7. Verify no instance is created
8. Verify instances list remains unchanged

### Expected Results
- Database tab is accessible (user can view databases)
- "Create instance" button is not available OR is disabled for users without permission
- Error message "Permission denied" is displayed (if action is attempted)
- No instance is created
- Permission restrictions are enforced

### Postconditions
- No instance is created
- Instances list remains unchanged
- User "user@example.com" remains in Project Editor
- Permission restrictions are maintained

---

## Test ID: DB-INSTANCE-CREATE-003
## Test Name: Create Database Instance - Verify Multiple Instances Can Be Created
## Test Type: Positive
## Related Use Cases: Create Database Instance

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- At least one database instance already exists for "default database" in the project
- Database tab is active in Project Editor
- "default database" is selected

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"

### Test Steps
1. Verify user is in Project Editor with Database tab active
2. Verify existing instance(s) are displayed in instances list
3. Count the number of instances in the list
4. Click "Create instance" button
5. Verify a new instance is created
6. Verify new instance appears in instances list
7. Verify total number of instances has increased by one
8. Verify all instances are displayed in the list
9. Verify each instance has a unique identifier
10. Verify no error messages are displayed

### Expected Results
- Multiple instances can be created for the same database type
- Each instance is created successfully
- All instances are displayed in instances list
- Instances are properly distinguished
- No conflicts occur between instances

### Postconditions
- Multiple instances exist for "default database" in project "TestProject"
- All instances are displayed in instances list
- User remains in Project Editor
- All instances are accessible

---

## Test ID: DB-INSTANCE-CREATE-004
## Test Name: Create Database Instance - Verify Instance Persistence
## Test Type: Positive (Verification)
## Related Use Cases: Create Database Instance

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Project Editor for project "TestProject"
- Project "TestProject" exists and belongs to the logged-in user
- Database tab is active in Project Editor
- "default database" is selected

### Test Data
- Project Name: "TestProject"
- Database Type: "default database"

### Test Steps
1. Verify user is in Project Editor with Database tab active
2. Click "Create instance" button
3. Verify new instance is created and displayed
4. Navigate away from Database tab (click Project tab)
5. Navigate back to Database tab
6. Verify Database tab is active
7. Verify "default database" is selected
8. Verify the created instance is still displayed in instances list
9. Verify instance data is persisted in the system

### Expected Results
- Instance is created successfully
- After navigation away and back, instance still exists
- Instance is displayed in instances list after returning
- Instance data is persisted in the database/system

### Postconditions
- Instance exists and is persisted
- Instance is displayed after navigation
- User is in Project Editor with Database tab active
- Instance is accessible

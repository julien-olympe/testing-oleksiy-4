# Add Project Permission Test Scenarios

## Test ID: PERM-ADD-001
## Test Name: Add Project Permission - Positive Case
## Test Type: Positive
## Related Use Cases: Add Project Permission

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "newuser@example.com" and password "SecurePass456!"
- User "newuser@example.com" is registered in the system
- Project "TestProject" exists and belongs to "owner@example.com"
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "TestProject"
- User "newuser@example.com" does NOT currently have permission to access "TestProject"

### Test Data
- Owner Email: "owner@example.com"
- New User Email: "newuser@example.com"
- Project Name: "TestProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify left side panel brick list is hidden
5. Verify center area displays user list showing current user ("owner@example.com")
6. Verify "Add a user" button is displayed
7. Click "Add a user" button
8. Verify add user interface is displayed with email input field
9. Enter "newuser@example.com" in the email input field
10. Click confirmation button (or press Enter, depending on UI implementation)
11. Verify "newuser@example.com" is added to the user list
12. Verify permission is created and persisted
13. Verify "newuser@example.com" appears in the permissions list
14. Verify no error messages are displayed

### Expected Results
- Permissions tab is accessible and functional
- "Add a user" button is clickable
- Add user interface is displayed
- Email input field accepts input
- User email is validated as registered user
- Permission is created successfully
- New user appears in permissions list
- Permission is persisted in the system
- No error messages are displayed

### Postconditions
- User "newuser@example.com" has permission to access project "TestProject"
- Permission is persisted in the system
- User "newuser@example.com" appears in permissions list
- User "owner@example.com" remains in Project Editor
- User "newuser@example.com" can now access the project

---

## Test ID: PERM-ADD-002
## Test Name: Add Project Permission - Negative Case - User Not Found
## Test Type: Negative
## Related Use Cases: Add Project Permission

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- No user account exists with email "nonexistent@example.com"
- Project "TestProject" exists and belongs to "owner@example.com"
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "TestProject"

### Test Data
- Owner Email: "owner@example.com"
- Non-existent User Email: "nonexistent@example.com"
- Project Name: "TestProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify "Add a user" button is displayed
5. Click "Add a user" button
6. Verify add user interface is displayed with email input field
7. Enter "nonexistent@example.com" in the email input field
8. Click confirmation button (or press Enter)
9. Verify permission creation fails
10. Verify error message "User not found" is displayed
11. Verify "nonexistent@example.com" is NOT added to the user list
12. Verify no permission is created
13. Verify user list remains unchanged

### Expected Results
- Add user interface is displayed
- Email input is accepted
- System validates that user exists
- Error message "User not found" is displayed
- No permission is created
- User list remains unchanged
- Only registered users can be added

### Postconditions
- No permission is created for "nonexistent@example.com"
- User list remains unchanged
- User "owner@example.com" remains in Project Editor
- Error message is displayed

---

## Test ID: PERM-ADD-003
## Test Name: Add Project Permission - Negative Case - User Already Has Permission
## Test Type: Negative
## Related Use Cases: Add Project Permission

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "existinguser@example.com" and password "SecurePass456!"
- Project "TestProject" exists and belongs to "owner@example.com"
- User "existinguser@example.com" already has permission to access "TestProject"
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "TestProject"

### Test Data
- Owner Email: "owner@example.com"
- Existing User Email: "existinguser@example.com"
- Project Name: "TestProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify "existinguser@example.com" is already displayed in the user list
5. Verify "Add a user" button is displayed
6. Click "Add a user" button
7. Verify add user interface is displayed with email input field
8. Enter "existinguser@example.com" in the email input field
9. Click confirmation button (or press Enter)
10. Verify permission creation fails
11. Verify error message "User already has permission" is displayed
12. Verify "existinguser@example.com" is NOT duplicated in the user list
13. Verify no duplicate permission is created
14. Verify user list remains unchanged (no duplicates)

### Expected Results
- Add user interface is displayed
- Email input is accepted
- System validates that user does not already have permission
- Error message "User already has permission" is displayed
- No duplicate permission is created
- User list remains unchanged (no duplicates)
- Duplicate permissions are prevented

### Postconditions
- No duplicate permission is created
- User list remains unchanged (no duplicates)
- User "owner@example.com" remains in Project Editor
- Error message is displayed

---

## Test ID: PERM-ADD-004
## Test Name: Add Project Permission - Negative Case - Invalid Email Format
## Test Type: Negative
## Related Use Cases: Add Project Permission

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- Project "TestProject" exists and belongs to "owner@example.com"
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "TestProject"

### Test Data
- Owner Email: "owner@example.com"
- Invalid Email: "invalid-email-format" (invalid format)
- Project Name: "TestProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify "Add a user" button is displayed
5. Click "Add a user" button
6. Verify add user interface is displayed with email input field
7. Enter "invalid-email-format" in the email input field
8. Attempt to click confirmation button (or press Enter)
9. Verify form validation prevents submission OR error is displayed
10. Verify error message is displayed indicating invalid email format
11. Verify no permission is created
12. Verify user list remains unchanged

### Expected Results
- Add user interface is displayed
- Email input is accepted
- Form validation prevents invalid email format OR error is displayed
- Error message indicates invalid email format
- No permission is created
- User list remains unchanged

### Postconditions
- No permission is created
- User list remains unchanged
- User "owner@example.com" remains in Project Editor
- Error message is displayed

---

## Test ID: PERM-ADD-005
## Test Name: Add Project Permission - Negative Case - Empty Email Field
## Test Type: Negative
## Related Use Cases: Add Project Permission

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- Project "TestProject" exists and belongs to "owner@example.com"
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "TestProject"

### Test Data
- Owner Email: "owner@example.com"
- Empty Email: "" (empty string)
- Project Name: "TestProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify "Add a user" button is displayed
5. Click "Add a user" button
6. Verify add user interface is displayed with email input field
7. Leave email input field empty
8. Attempt to click confirmation button (or press Enter)
9. Verify form validation prevents submission OR error is displayed
10. Verify error message is displayed indicating email is required
11. Verify no permission is created
12. Verify user list remains unchanged

### Expected Results
- Add user interface is displayed
- Empty email field is not accepted
- Form validation prevents submission OR error is displayed
- Error message indicates email is required
- No permission is created
- User list remains unchanged

### Postconditions
- No permission is created
- User list remains unchanged
- User "owner@example.com" remains in Project Editor
- Error message is displayed

---

## Test ID: PERM-ADD-006
## Test Name: Add Project Permission - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Add Project Permission

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- User account exists with email "newuser@example.com" and password "SecurePass789!"
- Project "TestProject" exists and belongs to "owner@example.com"
- User "user@example.com" has permission to view the project but NOT to add permissions
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Project Editor for project "TestProject"

### Test Data
- User Email: "user@example.com"
- New User Email: "newuser@example.com"
- Project Name: "TestProject"

### Test Steps
1. Verify user "user@example.com" is in Project Editor
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify "Add a user" button is NOT displayed OR is disabled (if user lacks permission)
5. If "Add a user" button is visible, attempt to click it
6. If button is clicked, verify action fails
7. Verify error message "Permission denied" is displayed (if action is attempted)
8. Verify no permission can be added
9. Verify user list remains unchanged

### Expected Results
- Permissions tab is accessible (user can view permissions)
- "Add a user" button is not available OR is disabled for users without permission
- Error message "Permission denied" is displayed (if action is attempted)
- No permission can be added
- Permission restrictions are enforced

### Postconditions
- No permission is created
- User list remains unchanged
- User "user@example.com" remains in Project Editor
- Permission restrictions are maintained

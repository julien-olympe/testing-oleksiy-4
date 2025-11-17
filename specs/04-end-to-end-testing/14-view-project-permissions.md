# View Project Permissions Test Scenarios

## Test ID: PERM-VIEW-001
## Test Name: View Project Permissions - Positive Case
## Test Type: Positive
## Related Use Cases: View Project Permissions

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user1@example.com" and password "SecurePass456!"
- User account exists with email "user2@example.com" and password "SecurePass789!"
- Project "TestProject" exists and belongs to "owner@example.com"
- User "user1@example.com" has permission to access "TestProject"
- User "user2@example.com" has permission to access "TestProject"
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "TestProject"

### Test Data
- Owner Email: "owner@example.com"
- User1 Email: "user1@example.com"
- User2 Email: "user2@example.com"
- Project Name: "TestProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Verify Project tab is active by default
3. Click Permissions tab in the header
4. Verify Permissions tab is now active
5. Verify left side panel brick list is hidden
6. Verify center area displays user list
7. Verify user list displays "owner@example.com" (project owner)
8. Verify user list displays "user1@example.com"
9. Verify user list displays "user2@example.com"
10. Verify all users with permissions are displayed
11. Verify each user's email address is clearly visible
12. Verify no error messages are displayed

### Expected Results
- Permissions tab is clickable and functional
- Permissions tab becomes active when clicked
- Brick list is hidden in Permissions tab
- User list is displayed correctly
- All users with permissions are listed
- Each user's email is displayed
- List is accurate and up-to-date
- No error messages are displayed

### Postconditions
- Permissions tab is active
- User list is displayed with all users who have permissions
- User "owner@example.com" remains in Project Editor
- User can see all project permissions

---

## Test ID: PERM-VIEW-002
## Test Name: View Project Permissions - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: View Project Permissions

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
4. If Project Editor is opened, attempt to click Permissions tab
5. Verify access is denied OR Permissions tab is not accessible
6. Verify error message "Permission denied" is displayed
7. Verify user cannot view project permissions

### Expected Results
- Project is not visible to unauthorized user OR access is denied
- Permissions tab is not accessible
- Error message "Permission denied" is displayed (if access is attempted)
- User cannot view permissions without proper access
- Permission restrictions are enforced

### Postconditions
- User cannot view project permissions
- User remains on Home Screen or is denied access
- Permission restrictions are maintained

---

## Test ID: PERM-VIEW-003
## Test Name: View Project Permissions - Verify Empty Permissions List
## Test Type: Positive (Verification)
## Related Use Cases: View Project Permissions

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- Project "NewProject" exists and belongs to "owner@example.com"
- Project "NewProject" has no additional users with permissions (only owner)
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "NewProject"

### Test Data
- Owner Email: "owner@example.com"
- Project Name: "NewProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Click Permissions tab in the header
3. Verify Permissions tab is now active
4. Verify center area displays user list
5. Verify user list displays only "owner@example.com" (project owner)
6. Verify no other users are displayed
7. Verify "Add a user" button is displayed (if user has permission to add users)
8. Verify list is empty except for owner
9. Verify no error messages are displayed

### Expected Results
- Permissions tab is accessible
- User list is displayed
- Only project owner is listed
- List accurately reflects current permissions
- No error messages are displayed

### Postconditions
- Permissions tab is active
- User list shows only project owner
- User "owner@example.com" remains in Project Editor
- User can add permissions if needed

---

## Test ID: PERM-VIEW-004
## Test Name: View Project Permissions - Verify Permissions List Updates
## Test Type: Positive (Verification)
## Related Use Cases: View Project Permissions, Add Project Permission

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "newuser@example.com" and password "SecurePass456!"
- Project "TestProject" exists and belongs to "owner@example.com"
- User "newuser@example.com" is registered in the system
- User "newuser@example.com" does NOT currently have permission to access "TestProject"
- User "owner@example.com" is logged in and authenticated
- User "owner@example.com" is in Project Editor for project "TestProject"

### Test Data
- Owner Email: "owner@example.com"
- New User Email: "newuser@example.com"
- Project Name: "TestProject"

### Test Steps
1. Verify user "owner@example.com" is in Project Editor
2. Click Permissions tab
3. Verify Permissions tab is active
4. Verify user list displays only "owner@example.com"
5. Verify "newuser@example.com" is NOT in the list
6. Click "Add a user" button
7. Enter "newuser@example.com" in email input field
8. Confirm adding user
9. Verify "newuser@example.com" is added to permissions
10. Verify user list updates immediately
11. Verify "newuser@example.com" appears in the user list
12. Verify list reflects the new permission

### Expected Results
- Permissions list is displayed
- List updates immediately after adding permission
- New user appears in the list
- List accurately reflects current permissions
- Updates are visible without page refresh

### Postconditions
- Permissions list includes "newuser@example.com"
- List is updated and accurate
- User "owner@example.com" remains in Project Editor
- Permission is persisted

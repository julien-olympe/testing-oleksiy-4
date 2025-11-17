# Open Project Editor Test Scenarios

## Test ID: PROJ-OPEN-001
## Test Name: Open Project Editor - Positive Case
## Test Type: Positive
## Related Use Cases: Open Project Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to access the project

### Test Data
- Project Name: "TestProject"

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Double-click on project "TestProject"
4. Verify Project Editor is opened
5. Verify Project Editor displays settings icon in top-right corner
6. Verify Project Editor displays header with tabs: Project, Permissions, Database
7. Verify Project tab is active by default
8. Verify left side panel shows search bar and brick list
9. Verify "Function" brick is visible in the brick list
10. Verify center area shows function list (may be empty if no functions exist)
11. Verify user can see all three tabs (Project, Permissions, Database)
12. Verify no error messages are displayed

### Expected Results
- Double-click action is recognized
- Project Editor opens successfully
- Project Editor displays all required UI elements
- Project tab is active by default
- Left side panel shows brick list with "Function" brick
- Center area shows function list
- All tabs are visible and accessible
- No error messages are displayed

### Postconditions
- Project Editor is open and displayed
- User is in Project Editor view
- Project tab is active
- User can navigate to other tabs
- User can create functions, manage permissions, and view databases

---

## Test ID: PROJ-OPEN-002
## Test Name: Open Project Editor - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Open Project Editor

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "PrivateProject" exists and belongs to "owner@example.com"
- User "user@example.com" does NOT have permission to access the project
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is on Home Screen
- Project "PrivateProject" is NOT visible to "user@example.com" (no permission)

### Test Data
- Project Name: "PrivateProject"

### Test Steps
1. Verify user "user@example.com" is on Home Screen
2. Verify project "PrivateProject" is NOT displayed in the project list (user has no permission)
3. If project is visible but user lacks permission, attempt to double-click on project "PrivateProject"
4. If double-click is attempted, verify access is denied
5. Verify error message "Permission denied" is displayed
6. Verify Project Editor is NOT opened
7. Verify user remains on Home Screen
8. Verify user cannot access the project

### Expected Results
- Project is not visible to unauthorized user OR access is denied
- Error message "Permission denied" is displayed (if access is attempted)
- Project Editor is not opened
- User remains on Home Screen
- Permission restrictions are enforced

### Postconditions
- Project Editor is not opened
- User remains on Home Screen
- User cannot access the project
- Permission restrictions are maintained

---

## Test ID: PROJ-OPEN-003
## Test Name: Open Project Editor - Verify Project Data Loading
## Test Type: Positive (Verification)
## Related Use Cases: Open Project Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- Project "TestProject" contains at least one function named "TestFunction"
- Project "TestProject" has at least one permission granted to another user
- Project "TestProject" contains at least one database instance
- User has permission to access the project

### Test Data
- Project Name: "TestProject"
- Function Name: "TestFunction"

### Test Steps
1. Verify user is on Home Screen
2. Verify project "TestProject" is displayed in the project list
3. Double-click on project "TestProject"
4. Verify Project Editor opens
5. Verify Project tab is active
6. Verify function "TestFunction" is displayed in the function list
7. Click Permissions tab
8. Verify Permissions tab is active
9. Verify user list displays users with permissions (including current user)
10. Click Database tab
11. Verify Database tab is active
12. Verify database types are displayed (including "default database")
13. Verify database instances are displayed
14. Verify all project data is loaded correctly

### Expected Results
- Project Editor opens successfully
- All project data is loaded
- Functions are displayed in Project tab
- Permissions are displayed in Permissions tab
- Database types and instances are displayed in Database tab
- All data is accurate and up-to-date

### Postconditions
- Project Editor is open
- All project data is loaded and displayed
- User can navigate between tabs
- All data is accessible

---

## Test ID: PROJ-OPEN-004
## Test Name: Open Project Editor - Verify Tab Navigation
## Test Type: Positive (Verification)
## Related Use Cases: Open Project Editor

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Project "TestProject" exists and belongs to the logged-in user
- User has permission to access the project

### Test Data
- Project Name: "TestProject"

### Test Steps
1. Verify user is on Home Screen
2. Double-click on project "TestProject"
3. Verify Project Editor opens with Project tab active
4. Verify left side panel shows brick list with "Function" brick
5. Click Permissions tab
6. Verify Permissions tab is now active
7. Verify left side panel brick list is hidden
8. Verify center area shows permissions interface
9. Click Database tab
10. Verify Database tab is now active
11. Verify left side panel brick list is hidden
12. Verify center area shows database interface
13. Click Project tab
14. Verify Project tab is now active
15. Verify left side panel brick list is visible again with "Function" brick

### Expected Results
- All tabs are clickable and functional
- Tab switching works correctly
- Brick list is hidden in Permissions and Database tabs
- Brick list is visible in Project tab
- Content area updates correctly for each tab
- Navigation is smooth and responsive

### Postconditions
- Project Editor is open
- User can navigate between all tabs
- UI updates correctly for each tab
- All functionality is accessible

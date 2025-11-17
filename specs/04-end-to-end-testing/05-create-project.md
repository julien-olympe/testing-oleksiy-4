# Create Project Test Scenarios

## Test ID: PROJ-CREATE-001
## Test Name: Create Project - Positive Case
## Test Type: Positive
## Related Use Cases: Create Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- Home Screen displays project list (may be empty)

### Test Data
- Default Project Name: "New Project" (system-generated default name)

### Test Steps
1. Verify user is on Home Screen
2. Verify left side panel is displayed with search bar and brick list
3. Verify "Project" brick is visible in the brick list on the left side
4. Verify center and right area displays project list (may be empty)
5. Drag "Project" brick from left side brick list
6. Drag the brick over the center project list area
7. Drop "Project" brick in the project list area
8. Verify drop action is detected
9. Verify a new project is created
10. Verify project is created with default name "New Project"
11. Verify project is assigned to the logged-in user as owner
12. Verify project appears in the project list on Home Screen
13. Verify project is displayed immediately after creation
14. Verify no error messages are displayed

### Expected Results
- Home Screen is displayed correctly
- "Project" brick is visible and draggable in the brick list
- Drag and drop action is successful
- New project is created successfully
- Project has default name "New Project"
- Project is assigned to the current user
- Project appears in the project list immediately
- Project is persisted in the system
- No error messages are displayed

### Postconditions
- Project "New Project" exists in the system
- Project belongs to user "testuser@example.com"
- Project is displayed in the project list on Home Screen
- User remains on Home Screen
- Project can be opened, renamed, or deleted

---

## Test ID: PROJ-CREATE-002
## Test Name: Create Project - Negative Case - Drag to Invalid Location
## Test Type: Negative
## Related Use Cases: Create Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen

### Test Data
- No test data required

### Test Steps
1. Verify user is on Home Screen
2. Verify "Project" brick is visible in the brick list
3. Drag "Project" brick from left side brick list
4. Drag the brick to an invalid drop location (e.g., outside project list area, on search bar, on settings icon)
5. Release/drop the brick in the invalid location
6. Verify drop is not accepted in invalid location
7. Verify no project is created
8. Verify project list remains unchanged
9. Verify brick returns to original position or drag is cancelled
10. Verify no error messages are displayed (or appropriate feedback is shown)

### Expected Results
- Drag action is initiated
- Drop in invalid location is not accepted
- No project is created
- Project list remains unchanged
- Brick drag is cancelled or brick returns to list
- User receives appropriate feedback (visual or message)

### Postconditions
- No new project is created
- Project list remains unchanged
- User remains on Home Screen
- User can attempt to create project again in valid location

---

## Test ID: PROJ-CREATE-003
## Test Name: Create Project - Verify Multiple Projects Can Be Created
## Test Type: Positive
## Related Use Cases: Create Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen
- At least one project already exists (created in previous test or setup)

### Test Data
- Default Project Names: "New Project", "New Project" (system may append numbers for uniqueness)

### Test Steps
1. Verify user is on Home Screen
2. Verify existing project(s) are displayed in project list
3. Count the number of projects in the list
4. Drag "Project" brick from left side brick list to project list area
5. Drop "Project" brick
6. Verify a new project is created
7. Verify new project appears in the project list
8. Verify total number of projects has increased by one
9. Verify all projects are displayed in the list
10. Verify each project has a unique identifier or name
11. Verify no error messages are displayed

### Expected Results
- Multiple projects can be created
- Each project is created successfully
- All projects are displayed in the project list
- Projects are properly distinguished (by name or identifier)
- No conflicts occur between projects

### Postconditions
- Multiple projects exist for the user
- All projects are displayed in the project list
- User remains on Home Screen
- All projects are accessible

---

## Test ID: PROJ-CREATE-004
## Test Name: Create Project - Verify Project Persistence After Page Refresh
## Test Type: Positive (Verification)
## Related Use Cases: Create Project

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen

### Test Data
- Default Project Name: "New Project"

### Test Steps
1. Verify user is on Home Screen
2. Drag "Project" brick from left side brick list to project list area
3. Drop "Project" brick
4. Verify project "New Project" is created and displayed
5. Refresh the browser page (F5 or browser refresh button)
6. Wait for page to reload
7. Verify user remains logged in (session persists)
8. Verify Home Screen is displayed after refresh
9. Verify project "New Project" is still displayed in the project list
10. Verify project data is persisted in the system

### Expected Results
- Project is created successfully
- After page refresh, project still exists
- Project is displayed in the project list after refresh
- Project data is persisted in the database/system
- User session is maintained

### Postconditions
- Project "New Project" exists and is persisted
- Project is displayed after page refresh
- User remains logged in
- User is on Home Screen

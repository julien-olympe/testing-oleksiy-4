# 3-2. Project Management Use Cases

## Use Case: Create Project

**Description**: A logged-in user creates a new project by dragging the "Project" brick from the brick list to the project list area. The new project is created with a default name and added to the user's project list.

**Actors Involved**: Logged-in user

**Inputs and Their Sources**:
- Drag action: User drags "Project" brick from left-side brick list
- Drop action: User drops brick in center/right project list area

**Processing/Actions**:
1. System displays Home Screen with brick list on left showing "Project" brick
2. User searches for "Project" brick using search bar (optional)
3. User drags "Project" brick from brick list
4. User drops brick in project list area (center/right side)
5. System validates drop location is valid project list area
6. System generates default project name (e.g., "New Project" or "Project 1")
7. System creates project record in database associated with logged-in user
8. System adds project to user's project list
9. System displays new project in project list

**Outputs**:
- Success: New project appears in project list with default name
- Error: "Invalid drop location" message if brick dropped outside project list area
- Error: "Project creation failed" message if database operation fails

## Use Case: Rename Project

**Description**: A logged-in user changes the name of an existing project they own. The project name is updated in the database and displayed in the project list.

**Actors Involved**: Logged-in user (project owner)

**Inputs and Their Sources**:
- Project selection: User selects project from project list
- New name: User enters new project name in rename interface

**Processing/Actions**:
1. System displays Home Screen with user's projects
2. User selects project from project list (click or right-click to access rename option)
3. System displays rename interface (context menu or inline editing)
4. User enters new project name
5. User confirms rename action
6. System validates new name is not empty
7. System validates new name does not conflict with existing project names for the user
8. System updates project name in database
9. System refreshes project list to show updated name

**Outputs**:
- Success: Project name updated in project list
- Error: "Project name cannot be empty" message if name is empty
- Error: "Project name already exists" message if name conflicts
- Error: "Rename failed" message if database operation fails

## Use Case: Delete Project

**Description**: A logged-in user permanently removes a project they own from the system. All associated functions and data are deleted.

**Actors Involved**: Logged-in user (project owner)

**Inputs and Their Sources**:
- Project selection: User selects project from project list
- Delete confirmation: User confirms deletion action

**Processing/Actions**:
1. System displays Home Screen with user's projects
2. User selects project from project list
3. User accesses delete option (context menu or delete button)
4. System displays confirmation dialog
5. User confirms deletion
6. System validates user owns the project
7. System deletes all functions associated with project
8. System deletes all permissions associated with project
9. System deletes project record from database
10. System removes project from project list display

**Outputs**:
- Success: Project removed from project list
- Error: "Delete failed" message if database operation fails
- Error: "Unauthorized" message if user does not own project (should not occur due to user isolation)

## Use Case: View Projects

**Description**: A logged-in user views the list of projects they own. The system displays only projects belonging to the logged-in user, ensuring user isolation.

**Actors Involved**: Logged-in user

**Inputs and Their Sources**:
- User session: System identifies logged-in user from session

**Processing/Actions**:
1. User logs in successfully
2. System queries database for projects where owner matches logged-in user ID
3. System retrieves project list from database
4. System displays projects in center/right area of Home Screen
5. System displays project names and any additional project metadata

**Outputs**:
- Success: Project list displayed showing all user's projects
- Empty state: "No projects" message if user has no projects
- Projects are filtered to show only those owned by logged-in user (user isolation enforced)

## Use Case: Open Project Editor

**Description**: A logged-in user opens the Project Editor for a specific project by double-clicking the project in the project list. The Project Editor screen is displayed with the selected project context.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Double-click action: User double-clicks project in project list

**Processing/Actions**:
1. System displays Home Screen with project list
2. User double-clicks a project in the project list
3. System validates user has access to project (owner or has permissions)
4. System loads project data from database
5. System loads functions associated with project
6. System loads permissions associated with project
7. System loads databases associated with project
8. System displays Project Editor screen with Project tab active
9. System displays project functions in Project tab

**Outputs**:
- Success: Project Editor screen displayed with selected project loaded
- Error: "Access denied" message if user does not have permission to view project
- Error: "Project not found" message if project was deleted
- Error: "Failed to load project" message if database operation fails

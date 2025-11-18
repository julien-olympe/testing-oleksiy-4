# 3-3. Project Editor Use Cases

## Use Case: Create Function

**Description**: A user creates a new function within a project by dragging the "Function" brick from the brick list to the function list area in the Project tab. The new function is created with a default name.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Drag action: User drags "Function" brick from left-side brick list
- Drop action: User drops brick in Project tab central area

**Processing/Actions**:
1. System displays Project Editor with Project tab active and "Function" brick in brick list
2. User searches for "Function" brick using search bar
3. User drags and drops "Function" brick in Project tab central area
4. System validates drop location is valid function creation area
5. System generates default function name (e.g., "New Function" or "Function 1")
6. System creates function record in database and adds to project's function list
7. System displays new function in Project tab

**Outputs**:
- Success: New function appears in function list with default name
- Error: "Invalid drop location" message if brick dropped outside function list area
- Error: "Function creation failed" message if database operation fails

## Use Case: Rename Function

**Description**: A user changes the name of an existing function within a project. The function name is updated in the database.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Function selection: User selects function from function list in Project tab
- New name: User enters new function name in rename interface

**Processing/Actions**:
1. System displays Project Editor with Project tab active and functions list
2. User selects function and accesses rename interface (context menu or inline editing)
3. User enters new function name and confirms rename action
4. System validates new name is not empty and does not conflict with existing function names
5. System updates function name in database and refreshes function list

**Outputs**:
- Success: Function name updated in function list
- Error: "Function name cannot be empty" or "Function name already exists" messages
- Error: "Rename failed" message if database operation fails

## Use Case: Delete Function

**Description**: A user permanently removes a function from a project. All brick configurations and connections within the function are deleted.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Function selection: User selects function from function list in Project tab
- Delete confirmation: User confirms deletion action

**Processing/Actions**:
1. System displays Project Editor with Project tab active and functions list
2. User selects function and accesses delete option (context menu or delete button)
3. System displays confirmation dialog and user confirms deletion
4. System deletes all brick configurations, connection data, and function record from database
5. System removes function from function list display

**Outputs**:
- Success: Function removed from function list
- Error: "Delete failed" message if database operation fails

## Use Case: Open Function Editor

**Description**: A user opens the Function Editor for a specific function by double-clicking the function in the Project tab. The Function Editor screen is displayed with the selected function's brick configuration loaded.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Double-click action: User double-clicks function in Project tab function list

**Processing/Actions**:
1. System displays Project Editor with Project tab active and functions list
2. User double-clicks a function in the function list
3. System loads function data, brick configurations, and connection data from database
4. System displays Function Editor screen with bricks in central grid panel and connection lines

**Outputs**:
- Success: Function Editor screen displayed with function's brick configuration loaded
- Error: "Function not found" or "Failed to load function" messages

## Use Case: View Users with Permissions

**Description**: A user views the list of users who have access permissions for the current project. The list includes the project owner and all users who have been granted permissions.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Tab selection: User clicks Permissions tab in Project Editor header

**Processing/Actions**:
1. System displays Project Editor
2. User clicks Permissions tab in header
3. System queries database for project owner and all users with permissions for current project
4. System retrieves user information (email addresses, names if available)
5. System displays user list in central/left area showing project owner with indicator and all users with permissions

**Outputs**:
- Success: User list displayed showing project owner and users with permissions
- Empty state: Only project owner displayed if no additional users have permissions

## Use Case: Add User to Project Permissions

**Description**: A project owner adds a registered user to the project's permission list by entering the user's email address. Only registered users can be added.

**Actors Involved**: Logged-in user (project owner only)

**Inputs and Their Sources**:
- Email address: User enters email in "Add user" interface
- Add action: User clicks "Add user" button in Permissions tab

**Processing/Actions**:
1. System displays Project Editor with Permissions tab active and "Add user" button
2. User clicks "Add user" button, enters email address, and confirms add action
3. System validates email format and queries database to verify user exists (is registered)
4. If user not found or already has permissions, system displays error message
5. If user found and does not have permissions, system creates permission record in database
6. System adds user to permissions list display and refreshes user list

**Outputs**:
- Success: User added to permissions list, user appears in user list
- Error: "User not registered", "Invalid email format", "User already has permissions", "Add user failed", or "Only project owner can add users" messages

## Use Case: View Databases

**Description**: A user views the list of databases available in the current project. The system displays the default database and any additional databases.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Tab selection: User clicks Database tab in Project Editor header

**Processing/Actions**:
1. System displays Project Editor
2. User clicks Database tab in header
3. System queries database for databases associated with current project
4. System retrieves default database (always exists) and any additional databases
5. System displays database list on left side of Database tab with database names and properties

**Outputs**:
- Success: Database list displayed showing default database and any additional databases
- Default database is always present and displayed

## Use Case: Create Database Instance

**Description**: A user creates a new instance of a database and sets the string property value. The instance is stored in the database and displayed in the instance list.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Database selection: User selects database from database list (left side)
- Create action: User clicks "Create instance" button
- String property value: User enters string value in input field

**Processing/Actions**:
1. System displays Project Editor with Database tab active, database list on left, and instance list on right
2. User selects database from database list and clicks "Create instance" button
3. System displays input interface for string property and user enters string property value
4. User confirms creation and system validates string value is provided
5. System creates database instance record, stores string property value, and associates instance with selected database and project
6. System adds instance to instance list display and refreshes instance list on right side

**Outputs**:
- Success: New instance appears in instance list with entered string property value
- Error: "String property value required" or "Instance creation failed" messages

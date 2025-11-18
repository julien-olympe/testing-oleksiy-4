# 3-3. Project Editor Use Cases - Permissions and Database

## Use Case: View Users with Permissions

**Description**: A user views the list of users who have access permissions for the current project. The list includes the project owner and all users who have been granted permissions.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Tab selection: User clicks Permissions tab in Project Editor header

**Processing/Actions**:
1. System displays Project Editor
2. User clicks Permissions tab in header
3. System queries database for project owner
4. System queries database for all users with permissions for current project
5. System retrieves user information (email addresses, names if available)
6. System displays user list in central/left area of Permissions tab
7. System displays project owner with indicator
8. System displays all users with permissions

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
1. System displays Project Editor with Permissions tab active
2. System displays "Add user" button
3. User clicks "Add user" button
4. System displays email input interface
5. User enters email address
6. User confirms add action
7. System validates email format
8. System queries database to verify user with email exists (is registered)
9. If user not found, system displays error message
10. If user found, system checks if user already has permissions
11. If user already has permissions, system displays error message
12. If user does not have permissions, system creates permission record in database
13. System adds user to permissions list display
14. System refreshes user list

**Outputs**:
- Success: User added to permissions list, user appears in user list
- Error: "User not registered" message if email does not match any registered user
- Error: "Invalid email format" message if email format is invalid
- Error: "User already has permissions" message if user is already in permissions list
- Error: "Add user failed" message if database operation fails
- Error: "Only project owner can add users" message if user is not project owner

## Use Case: View Databases

**Description**: A user views the list of databases available in the current project. The system displays the default database and any additional databases.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Tab selection: User clicks Database tab in Project Editor header

**Processing/Actions**:
1. System displays Project Editor
2. User clicks Database tab in header
3. System queries database for databases associated with current project
4. System retrieves default database (always exists)
5. System retrieves any additional databases
6. System displays database list on left side of Database tab
7. System displays database names and properties

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
1. System displays Project Editor with Database tab active
2. System displays database list on left side
3. System displays instance list on right side
4. User selects database from database list (default database or other)
5. User clicks "Create instance" button
6. System displays input interface for string property
7. User enters string property value
8. User confirms creation
9. System validates string value is provided
10. System creates database instance record in database
11. System stores string property value
12. System associates instance with selected database and project
13. System adds instance to instance list display
14. System refreshes instance list on right side

**Outputs**:
- Success: New instance appears in instance list with entered string property value
- Error: "String property value required" message if value is empty
- Error: "Instance creation failed" message if database operation fails

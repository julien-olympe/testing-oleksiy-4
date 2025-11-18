# 4. Screens

## Login Screen

**Purpose**: Authenticate users and allow new user registration.

**Layout**:
- Central area displays login form and registration form
- Forms are side-by-side or tabbed interface
- Login form contains: email input field, password input field, "Login" button
- Registration form contains: email input field, password input field, "Register" button

**Components**:
- Email input field (text input)
- Password input field (password input, masked)
- Login button (triggers login use case)
- Register button (triggers registration use case)
- Error message area (displays validation and authentication errors)

**Navigation Flow**:
- User enters credentials and clicks Login → System validates and redirects to Home Screen on success
- User enters credentials and clicks Register → System creates account and redirects to Login Screen on success
- On successful login → Navigate to Home Screen
- On failed login → Display error message, remain on Login Screen
- On successful registration → Display success message, remain on Login Screen

## Home Screen

**Purpose**: Display user's projects and enable project management operations.

**Layout**:
- Top-right corner: Round settings icon (clickable)
- Left side: Search bar (text input) and brick list (scrollable list)
- Center/right side: Project list (grid or list view of user's projects)

**Components**:
- Settings icon (round icon, top-right): On click displays dropdown menu with user name and "Logout" option
- Search bar (text input, left side): Filters brick list as user types
- Brick list (left side): Displays searchable/filterable list of bricks, shows "Project" brick
- Project list (center/right): Displays all projects belonging to logged-in user
- Each project item: Shows project name, supports double-click to open, supports context menu for rename/delete

**Functionality**:
- Drag-and-drop: User drags "Project" brick from brick list and drops in project list area to create new project
- Double-click project: Opens Project Editor for selected project
- Right-click or context menu on project: Shows rename and delete options
- Click settings icon: Shows dropdown with user name and logout option
- Click logout: Executes logout use case, redirects to Login Screen

**Navigation Flow**:
- User double-clicks project → Navigate to Project Editor
- User clicks logout in settings menu → Navigate to Login Screen
- User remains on Home Screen for all other operations

## Project Editor Screen

**Purpose**: Manage functions, permissions, and databases within a project context.

**Layout**:
- Top-right corner: Round settings icon (same as Home Screen)
- Header: Tab bar with three tabs: "Project", "Permissions", "Database"
- Left side: Search bar and brick list (shows "Function" brick)
- Central area: Tab content area (changes based on active tab)

**Components**:
- Settings icon (round icon, top-right): Same functionality as Home Screen
- Tab bar (header): Three clickable tabs - Project, Permissions, Database
- Search bar (left side): Filters brick list
- Brick list (left side): Displays "Function" brick, searchable/filterable
- Project tab content (central area): Function list showing all functions in project
- Permissions tab content (central/left area): User list showing project owner and users with permissions, "Add user" button
- Database tab content: Left side shows database list, right side shows instance list, "Create instance" button

**Project Tab**:
- Function list: Displays all functions in current project
- Each function item: Shows function name, supports double-click to open Function Editor, supports context menu for rename/delete
- Drag-and-drop: User drags "Function" brick from brick list and drops in function list area to create new function

**Permissions Tab**:
- User list: Displays project owner (with indicator) and all users with permissions
- Each user item: Shows user email address
- "Add user" button: Opens interface to add user by email
- Add user interface: Email input field, "Add" button, "Cancel" button

**Database Tab**:
- Database list (left side): Shows "default database" and any additional databases
- Instance list (right side): Shows all instances of selected database
- "Create instance" button: Opens interface to create new instance
- Create instance interface: String property input field, "Create" button, "Cancel" button
- Instance items: Display instance ID and string property value

**Navigation Flow**:
- User clicks Project tab → Project tab content displayed
- User clicks Permissions tab → Permissions tab content displayed
- User clicks Database tab → Database tab content displayed
- User double-clicks function in Project tab → Navigate to Function Editor
- User clicks logout in settings menu → Navigate to Login Screen
- User can switch between tabs at any time

## Function Editor Screen

**Purpose**: Build visual programming logic by adding and connecting bricks, and execute functions.

**Layout**:
- Top-right corner: Round settings icon (same as other screens)
- Left side: Search bar and brick list
- Above search bar: RUN button
- Central area: Grid panel for bricks and connections

**Components**:
- Settings icon (round icon, top-right): Same functionality as other screens
- RUN button (above search bar, left side): Executes function logic when clicked
- Search bar (left side): Filters brick list
- Brick list (left side): Displays three bricks - "List instances by DB name", "Get first instance", "Log instance props"
- Grid panel (central area): Grid layout where bricks are positioned, supports drag-and-drop of bricks, displays connection lines between bricks

**Brick Display**:
- Each brick shows: Brick name, input ports (labeled), output ports (labeled)
- "List instances by DB name" brick: Input "Name of DB" (clickable, shows dropdown), Output "List"
- "Get first instance" brick: Input "List", Output "DB"
- "Log instance props" brick: Input "Object", Output "value"

**Connection Lines**:
- Visual lines connecting output ports to input ports
- Lines are drawn between connected bricks
- Lines update position when bricks are moved in grid

**Console Output**:
- Console area displays execution results
- Shows logged values from "Log instance props" brick
- Displays property names and values
- Visible after RUN button execution

**Functionality**:
- Drag-and-drop: User drags brick from brick list and drops in grid panel to add brick
- Click input port: For configurable inputs (e.g., "Name of DB"), shows dropdown or input interface
- Drag from output to input: Creates connection line between bricks
- Click RUN button: Validates connections and configurations, executes function, displays console output
- Grid positioning: Bricks snap to grid cells when dropped

**Navigation Flow**:
- User clicks logout in settings menu → Navigate to Login Screen
- User remains on Function Editor for all brick operations and execution
- No direct navigation to other screens from Function Editor (user must use browser back or return to Project Editor)

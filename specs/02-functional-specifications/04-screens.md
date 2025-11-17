# Chapter 4 - Screens

## General Layout

The application uses a consistent layout structure across all screens. The top-right corner of every screen contains a round icon button that opens a settings menu. The settings menu displays the logged-in user's name and provides a logout option.

Navigation between screens occurs through user interactions: double-clicking projects opens the Project Editor, double-clicking functions opens the Function Editor, and clicking the logout option returns users to the Login screen.

The application maintains a single-page application architecture where screen transitions occur without full page reloads. The system preserves user context and session state during navigation.

## Menu and Navigation

**Settings Menu**: The round icon button in the top-right corner of all screens opens a dropdown menu containing:
- User name display (read-only)
- Logout option (clickable)

**Navigation Flow**:
- Login Screen → Home Screen (after successful login or registration)
- Home Screen → Project Editor (double-click on project)
- Project Editor → Function Editor (double-click on function)
- Any Screen → Login Screen (via logout)

**Breadcrumb Navigation**: Not provided. Users navigate back by closing editors or using browser navigation controls.

## Login Screen

**Layout**: The Login Screen is a centered form interface with input fields and action buttons.

**UI Elements**:
- Email address input field
- Password input field
- Login button
- Register link or button
- Application title or branding

**Navigation**:
- Clicking Login button with valid credentials navigates to Home Screen
- Clicking Register link navigates to registration interface (if separate) or shows registration form
- After successful registration, user is automatically logged in and navigated to Home Screen

**Related Use Cases**: Register, Login

**Error Handling**: Error messages display below the form or near relevant input fields when authentication fails or validation errors occur.

## Home Screen

**Layout**: The Home Screen is divided into three main areas:
- Left side: Search bar and brick list
- Center and right side: Project list area
- Top-right: Settings menu icon

**UI Elements**:

**Left Side Panel**:
- Search bar: Text input field for filtering bricks
- Brick list: Scrollable list displaying available bricks (initially only "Project" brick)
- Each brick in the list is draggable

**Center and Right Area**:
- Project list: Grid or list view displaying all projects belonging to the authenticated user
- Each project item displays the project name and supports:
  - Double-click to open Project Editor
  - Rename action (context menu or inline editing)
  - Delete action (context menu or delete button)

**Top-Right**:
- Round settings icon button

**Navigation**:
- Double-clicking a project opens the Project Editor for that project
- Dragging "Project" brick to project list area creates a new project
- Clicking settings icon opens settings menu with logout option

**Related Use Cases**: Create Project, Rename Project, Delete Project, Open Project Editor, Logout

**Interaction Details**: Dragging "Project" brick to project list area creates project. Search bar filters bricks in real-time. Project list updates immediately on changes.

## Project Editor

**Layout**: The Project Editor contains:
- Top-right: Settings menu icon
- Header: Tab navigation (Project, Permissions, Database tabs)
- Left side: Search bar and brick list (visible in Project tab only)
- Center and right side: Content area that changes based on active tab

**UI Elements**:

**Header Tabs**:
- Project tab: Active by default when editor opens
- Permissions tab: Clickable tab
- Database tab: Clickable tab

**Left Side Panel (Project Tab Only)**:
- Search bar: Text input field for filtering bricks
- Brick list: Scrollable list displaying available bricks (initially only "Function" brick)
- Each brick in the list is draggable

**Project Tab Content Area**:
- Function list: Grid or list view displaying all functions in the project
- Each function item displays the function name and supports:
  - Double-click to open Function Editor
  - Rename action (context menu or inline editing)
  - Delete action (context menu or delete button)

**Permissions Tab Content Area**:
- User list: List displaying all users who have permissions for the project
- Each user item displays the user's email address
- "Add a user" button: Clickable button that opens interface for adding users by email
- Add user interface: Email input field and confirmation button

**Database Tab Content Area**:
- Left side: Database type list displaying available database types (including "default database")
- Right side: Database instances list for the selected database type
- "Create instance" button: Clickable button for creating new instances
- Each instance in the list displays:
  - Instance identifier
  - Input field for the string property value
  - Auto-save functionality (saves when user inputs value)

**Navigation**:
- Clicking Project tab shows function list and brick list
- Clicking Permissions tab shows user list and add user interface (hides brick list)
- Clicking Database tab shows database types and instances (hides brick list)
- Double-clicking a function opens the Function Editor
- Clicking settings icon opens settings menu with logout option

**Related Use Cases**: Create Function, Rename Function, Delete Function, Open Function Editor, Add Project Permission, View Project Permissions, View Databases, Create Database Instance, Edit Database Instance Property, Logout

**Interaction Details**: Dragging "Function" brick creates function. Brick list hidden in Permissions/Database tabs, visible in Project tab. Database instance values auto-save on input. "Create instance" adds instance immediately.

## Function Editor

**Layout**: The Function Editor contains:
- Top-right: Settings menu icon
- Left side: Search bar, brick list, and RUN button
- Center: Grid-based canvas for assembling bricks

**UI Elements**:

**Left Side Panel**:
- RUN button: Positioned above the search bar, clickable button for executing function logic
- Search bar: Text input field for filtering bricks
- Brick list: Scrollable list displaying available bricks:
  - "List instances by DB name" brick
  - "Get first instance" brick
  - "Log instance props" brick
- Each brick in the list is draggable

**Center Canvas**:
- Grid-based layout: Bricks are placed on grid cells when dropped
- Visual bricks: Each brick displays:
  - Brick name/label
  - Input connection points (larger dots for visibility)
  - Output connection points (larger dots for visibility)
  - Configured input parameter values (when set)
- Connection lines: Visual lines connecting output dots to input dots between bricks
- Grid cells: Invisible grid structure that snaps bricks to positions

**Brick Specifications**:

**"List instances by DB name" Brick**:
- Input: "Name of DB" (clickable to show database selection dropdown)
- Output: "List"
- Functionality: Retrieves all instances of the specified database type

**"Get first instance" Brick**:
- Input: "List"
- Output: "DB"
- Functionality: Extracts the first instance from a list of database instances

**"Log instance props" Brick**:
- Input: "Object"
- Output: "value"
- Functionality: Outputs the object's properties to the console

**Navigation**:
- Clicking settings icon opens settings menu with logout option
- Closing the Function Editor returns to Project Editor (implementation-specific: may use back button, close button, or navigation control)

**Related Use Cases**: Add Brick to Function Editor, Link Bricks, Set Brick Input Parameter, Run Function, Logout

**Interaction Details**: Dragging brick to canvas adds at grid position. Clicking input parameter opens selection interface. Dragging output to input creates connection line. All changes auto-persist. RUN button validates and executes if valid. Results appear in browser console. Invalid configurations prevent execution with error messages.

**Visual Design Requirements**: Input/output points are larger dots. Connection lines show data flow direction. Grid cells align bricks. Bricks have clear labels and connection points.

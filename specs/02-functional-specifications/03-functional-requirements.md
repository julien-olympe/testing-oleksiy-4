# Chapter 3 - Functional Requirements

## Use Cases by Actor

### Actor: Authenticated User

An authenticated user is a registered user who has successfully logged into the system. All use cases require authentication except Register and Login.

## Use Case: Register

**Description**: New user creates account. **Actors**: Unauthenticated User. **Inputs**: Email, password, additional fields from registration form. **Processing**: Validates email not registered and format valid, validates password requirements, creates account, stores credentials, creates session, redirects to Home. **Outputs**: Success: Account created, authenticated, redirected. Errors: "Email already registered", "Invalid email format", "Password does not meet requirements".

## Use Case: Login

**Description**: Existing user authenticates. **Actors**: Unauthenticated User. **Inputs**: Email and password from login form. **Processing**: Validates credentials, creates session, redirects to Home. **Outputs**: Success: Authenticated, session created, redirected. Error: "Invalid email or password".

## Use Case: Logout

**Description**: Authenticated user ends session. **Actors**: Authenticated User. **Inputs**: Logout from settings menu. **Processing**: Invalidates session, clears data, redirects to Login. **Outputs**: Success: Session terminated, redirected.

## Use Case: Create Project

**Description**: User creates project by dragging "Project" brick. **Actors**: Authenticated User. **Inputs**: Drag "Project" brick to project list on Home screen. **Processing**: Detects drop, creates project with default name, assigns to user as owner, displays in list. **Outputs**: Success: Project created and displayed. Error: "Failed to create project".

## Use Case: Rename Project

**Description**: User changes project name. **Actors**: Authenticated User. **Inputs**: Project selection and new name. **Processing**: Validates permission, updates name, persists, updates display. **Outputs**: Success: Name updated. Errors: "Permission denied", "Invalid project name".

## Use Case: Delete Project

**Description**: User removes project. **Actors**: Authenticated User. **Inputs**: Project selection and delete action. **Processing**: Validates permission, deletes functions, instances, permissions, project, removes from display. **Outputs**: Success: Project deleted. Error: "Permission denied".

## Use Case: Open Project Editor

**Description**: User opens Project Editor by double-clicking project. **Actors**: Authenticated User. **Inputs**: Double-click project. **Processing**: Validates permission, loads data (functions, permissions, instances), displays editor with Project tab active. **Outputs**: Success: Editor displayed. Error: "Permission denied".

## Use Case: Create Function

**Description**: User creates function by dragging "Function" brick. **Actors**: Authenticated User. **Inputs**: Drag "Function" brick to function list in Project Editor. **Processing**: Detects drop, creates function with default name, assigns to project, creates empty definition, displays in list. **Outputs**: Success: Function created. Error: "Failed to create function".

## Use Case: Rename Function

**Description**: User changes function name. **Actors**: Authenticated User. **Inputs**: Function selection and new name. **Processing**: Validates permission, updates name, persists, updates display. **Outputs**: Success: Name updated. Errors: "Permission denied", "Invalid function name".

## Use Case: Delete Function

**Description**: User removes function. **Actors**: Authenticated User. **Inputs**: Function selection and delete action. **Processing**: Validates permission, deletes function and brick configurations, removes from project and display. **Outputs**: Success: Function deleted. Error: "Permission denied".

## Use Case: Open Function Editor

**Description**: User opens Function Editor by double-clicking function. **Actors**: Authenticated User. **Inputs**: Double-click function. **Processing**: Validates permission, loads function (bricks, connections), displays editor with visual representation, shows bricks, grid, RUN button. **Outputs**: Success: Editor displayed. Error: "Permission denied".

## Use Case: Add Project Permission

**Description**: User grants access to project via email. **Actors**: Authenticated User (owner or with permission rights). **Inputs**: Email from "Add a user" interface, add button click. **Processing**: Validates email corresponds to registered user, validates no existing permission, creates relationship, persists, displays in list. **Outputs**: Success: Permission added. Errors: "User not found", "User already has permission".

## Use Case: View Project Permissions

**Description**: User views users with project access. **Actors**: Authenticated User. **Inputs**: Click Permissions tab. **Processing**: Validates permission, retrieves users with permissions, displays list. **Outputs**: Success: Users displayed. Error: "Permission denied".

## Use Case: View Databases

**Description**: User views database types. **Actors**: Authenticated User. **Inputs**: Click Database tab. **Processing**: Validates permission, retrieves database types, displays list on left. **Outputs**: Success: Types displayed (including "default database"). Error: "Permission denied".

## Use Case: Create Database Instance

**Description**: User creates database instance. **Actors**: Authenticated User. **Inputs**: Database type selection, click "Create instance". **Processing**: Validates permission, creates instance of type, initializes properties, assigns to project, displays in list. **Outputs**: Success: Instance created. Error: "Permission denied".

## Use Case: Edit Database Instance Property

**Description**: User modifies instance property value. **Actors**: Authenticated User. **Inputs**: Property value input. **Processing**: Detects change, validates permission, updates value, auto-persists. **Outputs**: Success: Value updated. Errors: "Permission denied", "Invalid property value".

## Use Case: Add Brick to Function Editor

**Description**: User adds brick to canvas by dragging. **Actors**: Authenticated User. **Inputs**: Brick selection, drag to grid. **Processing**: Detects drop, determines grid position, creates brick instance, displays with inputs/outputs, auto-persists. **Outputs**: Success: Brick added. Error: "Invalid brick type".

## Use Case: Link Bricks

**Description**: User connects bricks by linking output to input. **Actors**: Authenticated User. **Inputs**: Source output selection, drag to target input. **Processing**: Validates types compatible, creates link, displays connection line, auto-persists. **Outputs**: Success: Link created. Errors: "Incompatible types", "Link already exists".

## Use Case: Set Brick Input Parameter

**Description**: User configures brick input parameter. **Actors**: Authenticated User. **Inputs**: Click input parameter, select value. **Processing**: Displays options, validates value, sets parameter, displays on brick, auto-persists. **Outputs**: Success: Parameter configured. Error: "Invalid parameter value".

---

## Use Case: Run Function

**Description**: User executes function logic. **Actors**: Authenticated User. **Inputs**: Click RUN button. **Processing**: Validates required inputs configured, validates links, executes logic in order, retrieves data from instances, processes through chain, outputs to console. **Outputs**: Success: Function executes, results in console. Errors: "Missing required inputs", "Invalid brick connections", "Execution failed".

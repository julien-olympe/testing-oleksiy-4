# 3-3. Project Editor Use Cases

## Use Case: Create Function

**Description**: A user creates a new function within a project by dragging the "Function" brick from the brick list to the function list area in the Project tab. The new function is created with a default name.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Drag action: User drags "Function" brick from left-side brick list
- Drop action: User drops brick in Project tab central area

**Processing/Actions**:
1. System displays Project Editor with Project tab active
2. System displays "Function" brick in left-side brick list
3. User searches for "Function" brick using search bar (optional)
4. User drags "Function" brick from brick list
5. User drops brick in Project tab central area
6. System validates drop location is valid function creation area
7. System generates default function name (e.g., "New Function" or "Function 1")
8. System creates function record in database associated with current project
9. System adds function to project's function list
10. System displays new function in Project tab

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
1. System displays Project Editor with Project tab active
2. System displays functions in Project tab
3. User selects function from function list
4. System displays rename interface (context menu or inline editing)
5. User enters new function name
6. User confirms rename action
7. System validates new name is not empty
8. System validates new name does not conflict with existing function names in project
9. System updates function name in database
10. System refreshes function list to show updated name

**Outputs**:
- Success: Function name updated in function list
- Error: "Function name cannot be empty" message if name is empty
- Error: "Function name already exists" message if name conflicts within project
- Error: "Rename failed" message if database operation fails

## Use Case: Delete Function

**Description**: A user permanently removes a function from a project. All brick configurations and connections within the function are deleted.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Function selection: User selects function from function list in Project tab
- Delete confirmation: User confirms deletion action

**Processing/Actions**:
1. System displays Project Editor with Project tab active
2. System displays functions in Project tab
3. User selects function from function list
4. User accesses delete option (context menu or delete button)
5. System displays confirmation dialog
6. User confirms deletion
7. System deletes all brick configurations associated with function
8. System deletes all connection data associated with function
9. System deletes function record from database
10. System removes function from function list display

**Outputs**:
- Success: Function removed from function list
- Error: "Delete failed" message if database operation fails

## Use Case: Open Function Editor

**Description**: A user opens the Function Editor for a specific function by double-clicking the function in the Project tab. The Function Editor screen is displayed with the selected function's brick configuration loaded.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Double-click action: User double-clicks function in Project tab function list

**Processing/Actions**:
1. System displays Project Editor with Project tab active
2. System displays functions in Project tab
3. User double-clicks a function in the function list
4. System loads function data from database
5. System loads brick configurations for function
6. System loads connection data for function
7. System displays Function Editor screen
8. System displays bricks in central grid panel
9. System displays connection lines between bricks

**Outputs**:
- Success: Function Editor screen displayed with function's brick configuration loaded
- Error: "Function not found" message if function was deleted
- Error: "Failed to load function" message if database operation fails

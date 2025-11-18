# 3-4. Function Editor Use Cases

## Use Case: Add Brick to Function

**Description**: A user adds a brick to the Function Editor by dragging it from the brick list to the central grid panel. The brick is positioned in a grid cell and becomes part of the function's logic.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Brick selection: User selects brick from left-side brick list (available bricks: "List instances by DB name", "Get first instance", "Log instance props")
- Drag action: User drags brick from brick list
- Drop action: User drops brick in central grid panel

**Processing/Actions**:
1. System displays Function Editor with brick list on left side
2. System displays available bricks: "List instances by DB name", "Get first instance", "Log instance props"
3. User searches for brick using search bar (optional)
4. User drags brick from brick list
5. User drops brick in central grid panel
6. System validates drop location is within grid panel
7. System calculates grid cell position for dropped brick
8. System creates brick configuration record in database
9. System associates brick with current function
10. System stores brick type and grid position
11. System displays brick in grid panel at calculated position
12. System displays brick with its inputs and outputs visible

**Outputs**:
- Success: Brick appears in central grid panel at grid cell position
- Error: "Invalid drop location" message if brick dropped outside grid panel
- Error: "Brick addition failed" message if database operation fails

## Use Case: Connect Bricks

**Description**: A user creates a connection between two bricks by dragging a line from an output of one brick to an input of another brick. The connection defines data flow between bricks.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Source output: User clicks and drags from output port of source brick
- Target input: User drops connection line on input port of target brick

**Processing/Actions**:
1. System displays Function Editor with bricks in grid panel
2. System displays input and output ports on each brick
3. User clicks on output port of source brick (e.g., "List" output of "List instances by DB name" brick)
4. User drags connection line from output port
5. User drops connection line on input port of target brick (e.g., "List" input of "Get first instance" brick)
6. System validates source output type matches target input type
7. System validates connection does not create circular dependencies
8. System creates connection record in database
9. System stores source brick ID and output name
10. System stores target brick ID and input name
11. System displays connection line between bricks
12. System updates visual representation of connection

**Outputs**:
- Success: Connection line displayed between source output and target input
- Error: "Output type does not match input type" message if types are incompatible
- Error: "Circular connection not allowed" message if connection creates cycle
- Error: "Connection failed" message if database operation fails

## Use Case: Configure Brick Input

**Description**: A user sets the value of a brick input that requires configuration. For "List instances by DB name" brick, the user selects a database name from a dropdown list of available databases.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Input selection: User clicks on configurable input of brick (e.g., "Name of DB" input of "List instances by DB name" brick)
- Value selection: User selects value from dropdown (e.g., selects "default database" from database list)

**Processing/Actions**:
1. System displays Function Editor with bricks in grid panel
2. System displays "List instances by DB name" brick with "Name of DB" input
3. User clicks on "Name of DB" input
4. System queries database for available databases in current project
5. System retrieves database list (includes "default database")
6. System displays dropdown list showing available database names
7. User selects database name from dropdown (e.g., "default database")
8. System validates selected database exists
9. System updates brick configuration in database
10. System stores selected database name as input value
11. System displays selected value in brick input
12. System updates visual representation of configured input

**Outputs**:
- Success: Input value displayed in brick, configuration saved
- Error: "Database not found" message if selected database does not exist
- Error: "Configuration failed" message if database operation fails

## Use Case: Execute Function

**Description**: A user executes the function logic by clicking the RUN button. The system validates all brick connections and configurations, then executes the logic defined by the connected bricks and displays results in the console.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- RUN action: User clicks RUN button (located above search bar)

**Processing/Actions**:
1. System displays Function Editor with RUN button visible
2. User assembles function logic by adding and connecting bricks
3. User configures brick inputs (e.g., sets "Name of DB" on "List instances by DB name" brick)
4. User clicks RUN button
5. System validates all required brick inputs are configured
6. System validates all brick outputs are connected to inputs (where required)
7. System validates no disconnected required inputs exist
8. If validation fails, system displays error message and stops execution
9. If validation passes, system executes function logic:
   - System processes "List instances by DB name" brick: queries database for instances of specified database
   - System passes instance list to "Get first instance" brick: retrieves first instance from list
   - System passes instance object to "Log instance props" brick: extracts and logs object properties
10. System displays execution results in console
11. System logs all console output from "Log instance props" brick

**Outputs**:
- Success: Function executes, console displays logged instance properties and values
- Error: "Brick connections incomplete" message if required connections are missing
- Error: "Brick input not configured" message if "Name of DB" is not set on "List instances by DB name" brick
- Error: "Execution failed" message if runtime error occurs during execution
- Console output: Displays all logged values from "Log instance props" brick

## Use Case: View Console Output

**Description**: A user views the execution results and logged values in the console after executing a function. The console displays all output from "Log instance props" bricks.

**Actors Involved**: Logged-in user (project owner or user with permissions)

**Inputs and Their Sources**:
- Execution completion: Function execution completes successfully
- Console data: System generates console output from "Log instance props" brick

**Processing/Actions**:
1. System executes function logic
2. System processes "Log instance props" brick
3. System extracts object properties from instance
4. System formats property values for display
5. System sends output to console
6. System displays console output in console area
7. System displays property names and values
8. System displays string property value from database instance

**Outputs**:
- Success: Console displays all logged instance properties
- Console shows property names and their values
- Console shows string property value from default database instance
- Console output is visible and readable

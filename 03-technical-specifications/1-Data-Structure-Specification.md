# Data Structure Specification

## Overview
This document defines all database entities, their attributes, relationships, and cardinalities for the visual programming application.

## Entities

### User
**Purpose and Essence:** Represents an authenticated user of the application. Stores authentication credentials and basic user information.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the user
- `email` (VARCHAR(255), Unique, Not Null): User's email address used for authentication
- `password_hash` (VARCHAR(255), Not Null): Bcrypt hashed password
- `created_at` (TIMESTAMP, Not Null): Account creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last update timestamp

**Relationships:**
- Owns many Projects (1:N) - A user can own multiple projects
- Has many ProjectPermissions (1:N) - A user can have permissions for multiple projects
- Cardinality: User(1) -> Project(N), User(1) -> ProjectPermission(N)

---

### Project
**Purpose and Essence:** Represents a visual programming project container. Groups related functions, databases, and permissions under a single owner.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the project
- `name` (VARCHAR(255), Not Null): Project display name
- `owner_id` (UUID, Foreign Key -> User.id, Not Null): Reference to the user who owns the project
- `created_at` (TIMESTAMP, Not Null): Project creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last update timestamp

**Relationships:**
- Belongs to User (N:1) - Each project has one owner
- Has many Functions (1:N) - A project contains multiple functions
- Has many ProjectPermissions (1:N) - A project can have multiple permission entries
- Has many Databases (1:N) - A project can have multiple database schemas
- Cardinality: Project(N) -> User(1), Project(1) -> Function(N), Project(1) -> ProjectPermission(N), Project(1) -> Database(N)

---

### Function
**Purpose and Essence:** Represents a visual function composed of connected bricks. Contains the visual programming logic within a project.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the function
- `name` (VARCHAR(255), Not Null): Function display name
- `project_id` (UUID, Foreign Key -> Project.id, Not Null): Reference to the parent project
- `created_at` (TIMESTAMP, Not Null): Function creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last update timestamp

**Relationships:**
- Belongs to Project (N:1) - Each function belongs to one project
- Has many FunctionBricks (1:N) - A function contains multiple bricks
- Cardinality: Function(N) -> Project(1), Function(1) -> FunctionBrick(N)

---

### ProjectPermission
**Purpose and Essence:** Represents access permissions for users to view and interact with projects they do not own. Enables project sharing functionality.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the permission entry
- `project_id` (UUID, Foreign Key -> Project.id, Not Null): Reference to the shared project
- `user_id` (UUID, Foreign Key -> User.id, Not Null): Reference to the user granted access
- `created_at` (TIMESTAMP, Not Null): Permission grant timestamp

**Relationships:**
- Belongs to Project (N:1) - Each permission entry references one project
- Belongs to User (N:1) - Each permission entry references one user
- Cardinality: ProjectPermission(N) -> Project(1), ProjectPermission(N) -> User(1)
- Constraint: Unique combination of (project_id, user_id) to prevent duplicate permissions

---

### Database
**Purpose and Essence:** Represents a database schema definition within a project. Defines the structure and properties of data instances.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the database schema
- `name` (VARCHAR(255), Not Null): Database schema name (e.g., "default database")
- `project_id` (UUID, Foreign Key -> Project.id, Not Null): Reference to the parent project
- `schema_definition` (JSONB, Not Null): JSON structure defining properties and their types (e.g., {"string_prop": "string"})
- `created_at` (TIMESTAMP, Not Null): Database schema creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last update timestamp

**Relationships:**
- Belongs to Project (N:1) - Each database schema belongs to one project
- Has many DatabaseInstances (1:N) - A database schema contains multiple data instances
- Cardinality: Database(N) -> Project(1), Database(1) -> DatabaseInstance(N)

---

### DatabaseInstance
**Purpose and Essence:** Represents a concrete data instance conforming to a database schema. Stores actual data values for a specific database definition.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the instance
- `database_id` (UUID, Foreign Key -> Database.id, Not Null): Reference to the parent database schema
- `data_values` (JSONB, Not Null): JSON object containing property values matching the schema definition
- `created_at` (TIMESTAMP, Not Null): Instance creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last update timestamp

**Relationships:**
- Belongs to Database (N:1) - Each instance belongs to one database schema
- Cardinality: DatabaseInstance(N) -> Database(1)

---

### FunctionBrick
**Purpose and Essence:** Represents a visual programming brick (node) within a function. Each brick has a type, position, configuration, and can connect to other bricks.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the brick
- `function_id` (UUID, Foreign Key -> Function.id, Not Null): Reference to the parent function
- `brick_type` (VARCHAR(100), Not Null): Type identifier (e.g., "ListInstancesByDBName", "GetFirstInstance", "LogInstanceProps")
- `position_x` (INTEGER, Not Null): X coordinate on the grid (grid cell position)
- `position_y` (INTEGER, Not Null): Y coordinate on the grid (grid cell position)
- `configuration` (JSONB, Not Null): JSON object storing brick-specific settings (e.g., selected database name for "ListInstancesByDBName")
- `created_at` (TIMESTAMP, Not Null): Brick creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last update timestamp

**Relationships:**
- Belongs to Function (N:1) - Each brick belongs to one function
- Has many outgoing BrickConnections (1:N) - A brick can have multiple output connections
- Has many incoming BrickConnections (1:N) - A brick can receive multiple input connections
- Cardinality: FunctionBrick(N) -> Function(1), FunctionBrick(1) -> BrickConnection(N) [as source], FunctionBrick(1) -> BrickConnection(N) [as target]

---

### BrickConnection
**Purpose and Essence:** Represents a connection between two bricks, linking an output of one brick to an input of another. Defines the data flow in the visual programming logic.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the connection
- `from_brick_id` (UUID, Foreign Key -> FunctionBrick.id, Not Null): Source brick reference
- `from_output_name` (VARCHAR(100), Not Null): Name of the output port on the source brick (e.g., "List", "DB", "value")
- `to_brick_id` (UUID, Foreign Key -> FunctionBrick.id, Not Null): Target brick reference
- `to_input_name` (VARCHAR(100), Not Null): Name of the input port on the target brick (e.g., "Name of DB", "List", "Object")
- `created_at` (TIMESTAMP, Not Null): Connection creation timestamp

**Relationships:**
- Connects FunctionBricks (N:1 and N:1) - Each connection links one source brick to one target brick
- Cardinality: BrickConnection(N) -> FunctionBrick(1) [as source], BrickConnection(N) -> FunctionBrick(1) [as target]
- Constraint: Both bricks must belong to the same function (enforced at application level)
- Constraint: Unique combination of (to_brick_id, to_input_name) to prevent multiple connections to the same input

---

## Database Indexes

**Performance Indexes:**
- `users.email` - Unique index for fast login lookups
- `projects.owner_id` - Index for filtering projects by owner
- `project_permissions.project_id` - Index for permission checks
- `project_permissions.user_id` - Index for user permission queries
- `functions.project_id` - Index for listing functions in a project
- `function_bricks.function_id` - Index for loading bricks in a function
- `database_instances.database_id` - Index for querying instances by database
- `brick_connections.from_brick_id` - Index for finding outgoing connections
- `brick_connections.to_brick_id` - Index for finding incoming connections

**Composite Indexes:**
- `project_permissions(project_id, user_id)` - Unique index for permission lookups
- `brick_connections(to_brick_id, to_input_name)` - Unique index for input connection validation

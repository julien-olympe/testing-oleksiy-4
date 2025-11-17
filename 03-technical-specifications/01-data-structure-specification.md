# Data Structure Specification

## Overview

This document defines the complete data structure for the visual programming application. All entities are stored in a PostgreSQL relational database with strict referential integrity.

## Entities

### User

**Purpose and Essence:** Represents an authenticated user account in the system. Users can own projects, be granted permissions to access other users' projects, and execute functions.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `email`: String, unique, required, indexed for login lookups
- `password_hash`: String, required, bcrypt-encrypted password
- `created_at`: Timestamp, auto-set on creation

**Relationships:**
- One-to-many with Project (owner_id): A user owns zero or more projects
- One-to-many with ProjectPermission (user_id): A user has zero or more project permissions

### Project

**Purpose and Essence:** Represents a container for functions, databases, and permissions. Projects are the primary organizational unit and are owned by a single user.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `name`: String, required, editable by owner
- `owner_id`: UUID foreign key to User, required, indexed
- `created_at`: Timestamp, auto-set on creation
- `updated_at`: Timestamp, auto-updated on modification

**Relationships:**
- Many-to-one with User (owner_id): Each project has exactly one owner
- One-to-many with ProjectPermission (project_id): A project has zero or more permission grants
- One-to-many with Database (project_id): A project contains zero or more databases
- One-to-many with Function (project_id): A project contains zero or more functions

### ProjectPermission

**Purpose and Essence:** Represents access rights granted to users for specific projects. Enables project sharing while maintaining ownership.

**Attributes:**
- `project_id`: UUID foreign key to Project, required, part of composite primary key
- `user_id`: UUID foreign key to User, required, part of composite primary key
- `created_at`: Timestamp, auto-set on creation

**Relationships:**
- Many-to-one with Project (project_id): Each permission belongs to exactly one project
- Many-to-one with User (user_id): Each permission grants access to exactly one user
- Composite primary key on (project_id, user_id) prevents duplicate permissions

### Database

**Purpose and Essence:** Represents a data type definition within a project. Contains properties that define the structure of database instances.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `name`: String, required, unique within project scope
- `project_id`: UUID foreign key to Project, required, indexed
- `created_at`: Timestamp, auto-set on creation

**Relationships:**
- Many-to-one with Project (project_id): Each database belongs to exactly one project
- One-to-many with DatabaseProperty (database_id): A database has one or more properties
- One-to-many with DatabaseInstance (database_id): A database has zero or more instances

### DatabaseProperty

**Purpose and Essence:** Represents a field definition within a database type. Defines the structure and type constraints for instance values.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `database_id`: UUID foreign key to Database, required, indexed
- `name`: String, required, unique within database scope
- `type`: String, required, enum: 'string', 'number', 'boolean', 'date'
- `created_at`: Timestamp, auto-set on creation

**Relationships:**
- Many-to-one with Database (database_id): Each property belongs to exactly one database
- One-to-many with DatabaseInstanceValue (property_id): A property has zero or more instance values

### DatabaseInstance

**Purpose and Essence:** Represents a concrete data instance of a database type. Contains values for all properties defined in the parent database.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `database_id`: UUID foreign key to Database, required, indexed
- `created_at`: Timestamp, auto-set on creation
- `updated_at`: Timestamp, auto-updated on modification

**Relationships:**
- Many-to-one with Database (database_id): Each instance belongs to exactly one database
- One-to-many with DatabaseInstanceValue (instance_id): An instance has one value per property

### DatabaseInstanceValue

**Purpose and Essence:** Represents a single property value for a database instance. Links instance, property, and value together.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `instance_id`: UUID foreign key to DatabaseInstance, required, indexed
- `property_id`: UUID foreign key to DatabaseProperty, required, indexed
- `value`: Text, required, stores serialized value based on property type
- `updated_at`: Timestamp, auto-updated on modification

**Relationships:**
- Many-to-one with DatabaseInstance (instance_id): Each value belongs to exactly one instance
- Many-to-one with DatabaseProperty (property_id): Each value corresponds to exactly one property
- Unique constraint on (instance_id, property_id) ensures one value per property per instance

### Function

**Purpose and Essence:** Represents a visual function definition within a project. Contains bricks and connections that define executable logic.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `name`: String, required, editable
- `project_id`: UUID foreign key to Project, required, indexed
- `created_at`: Timestamp, auto-set on creation
- `updated_at`: Timestamp, auto-updated on modification

**Relationships:**
- Many-to-one with Project (project_id): Each function belongs to exactly one project
- One-to-many with Brick (function_id): A function contains zero or more bricks
- One-to-many with BrickConnection (via from_brick_id or to_brick_id): A function contains zero or more connections

### Brick

**Purpose and Essence:** Represents a visual programming element in a function. Each brick has a type, position, and configuration that defines its behavior.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `function_id`: UUID foreign key to Function, required, indexed
- `type`: String, required, enum: 'ListInstancesByDB', 'GetFirstInstance', 'LogInstanceProps', 'Function'
- `position_x`: Integer, required, grid X coordinate
- `position_y`: Integer, required, grid Y coordinate
- `configuration`: JSONB, required, stores brick-specific settings (e.g., database name for ListInstancesByDB)
- `created_at`: Timestamp, auto-set on creation
- `updated_at`: Timestamp, auto-updated on modification

**Relationships:**
- Many-to-one with Function (function_id): Each brick belongs to exactly one function
- One-to-many with BrickConnection (from_brick_id): A brick has zero or more outgoing connections
- One-to-many with BrickConnection (to_brick_id): A brick has zero or more incoming connections

### BrickConnection

**Purpose and Essence:** Represents a data flow connection between two bricks. Defines how output from one brick flows into input of another.

**Attributes:**
- `id`: UUID primary key, auto-generated
- `from_brick_id`: UUID foreign key to Brick, required, indexed
- `from_output_name`: String, required, name of output port on source brick
- `to_brick_id`: UUID foreign key to Brick, required, indexed
- `to_input_name`: String, required, name of input port on target brick
- `created_at`: Timestamp, auto-set on creation

**Relationships:**
- Many-to-one with Brick (from_brick_id): Each connection originates from exactly one brick
- Many-to-one with Brick (to_brick_id): Each connection terminates at exactly one brick
- Unique constraint on (from_brick_id, from_output_name, to_brick_id, to_input_name) prevents duplicate connections

## Database Constraints

- All foreign keys have CASCADE DELETE except ProjectPermission which uses RESTRICT to prevent accidental permission loss
- All timestamps use UTC timezone
- All UUIDs use version 4 (random) generation
- Email addresses are validated at application level for format compliance
- Property types are enforced at application level with value serialization/deserialization

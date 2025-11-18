# API Description

## Introduction

This document comprehensively describes all REST APIs required for the visual programming application. All APIs follow RESTful principles and use JSON for request and response bodies.

### Authentication Mechanism

The application uses **JWT (JSON Web Token)** based authentication for all protected endpoints.

#### Token Format
- Token type: JWT (JSON Web Token)
- Algorithm: HS256 (HMAC SHA-256)
- Token payload includes:
  - `userId` (UUID): User's unique identifier
  - `email` (string): User's email address
  - `iat` (number): Issued at timestamp (Unix epoch)
  - `exp` (number): Expiration timestamp (Unix epoch)

#### Token Expiration
- Token expiration: **24 hours** from issuance
- No refresh token mechanism (users must re-authenticate after expiration)

#### Token Storage
- Token stored in **localStorage** on the client side
- Alternative: HTTP-only cookie (based on security requirements)
- Token must be sent with every authenticated request

#### Request Format
Include the JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Token Validation Requirements
- Token must be present in `Authorization` header for all protected endpoints
- Token must be valid (not expired, correct signature)
- Token must contain valid `userId` that exists in database
- Invalid or missing tokens return `401 Unauthorized`
- Expired tokens return `401 Unauthorized` with error message: "Token expired"

---

## Authentication APIs

### POST /api/auth/register

**Description**: Register a new user account in the system.

**Authentication**: Not required (public endpoint)

**Request Schema**:
```json
{
  "email": "string (required, valid email format, max 255 characters, unique)",
  "password": "string (required, minimum 8 characters)"
}
```

**Request Validation**:
- `email`: Required, must be valid email format, must not already exist in database
- `password`: Required, minimum 8 characters

**Response Schema (Success - 201 Created)**:
```json
{
  "message": "User registered successfully"
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Email already registered" | "Invalid email format" | "Password must be at least 8 characters"
}
```

**Status Codes**:
- `201 Created`: User account created successfully
- `400 Bad Request`: Invalid input data (email format, password length, duplicate email)

**Error Messages**:
- "Email already registered" - Email address already exists in database
- "Invalid email format" - Email does not match valid email pattern
- "Password must be at least 8 characters" - Password does not meet minimum length requirement

**Business Logic**:
1. Validate email format
2. Check if email already exists in database
3. Validate password meets minimum requirements (8 characters)
4. Hash password using bcrypt (salt rounds: 10)
5. Create user record in database with email and hashed password
6. Return success message

**Database Operations**:
- `SELECT` query to check if email exists
- `INSERT` into `users` table (id, email, password_hash, created_at, updated_at)

**Authorization Checks**: None (public endpoint)

---

### POST /api/auth/login

**Description**: Authenticate a user and receive a JWT token for subsequent requests.

**Authentication**: Not required (public endpoint)

**Request Schema**:
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required)"
}
```

**Request Validation**:
- `email`: Required, must be valid email format
- `password`: Required, non-empty string

**Response Schema (Success - 200 OK)**:
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "uuid",
    "email": "string"
  }
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Invalid email or password"
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Invalid email format"
}
```

**Status Codes**:
- `200 OK`: Authentication successful, token returned
- `400 Bad Request`: Invalid email format
- `401 Unauthorized`: Invalid credentials (email not found or password incorrect)

**Error Messages**:
- "Invalid email or password" - Email does not exist or password is incorrect (generic message for security)
- "Invalid email format" - Email does not match valid email pattern

**Business Logic**:
1. Validate email format
2. Query database for user with matching email
3. If user not found, return 401 error
4. Compare provided password with stored password hash using bcrypt
5. If password incorrect, return 401 error
6. Generate JWT token with userId, email, iat, exp (24 hours from now)
7. Return token and user information

**Database Operations**:
- `SELECT` query to find user by email

**Authorization Checks**: None (public endpoint)

---

### POST /api/auth/logout

**Description**: Logout the current user. This endpoint invalidates the session (client-side token removal).

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Status Codes**:
- `200 OK`: Logout successful
- `401 Unauthorized`: Missing or invalid token

**Error Messages**:
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token
2. Return success message (token invalidation is handled client-side by removing token from localStorage)

**Database Operations**: None (stateless logout)

**Authorization Checks**: Token validation only

---

## Project APIs

### GET /api/projects

**Description**: Retrieve list of all projects owned by the authenticated user or projects shared with the user via permissions.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Query Parameters**: None

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "ownerId": "uuid",
      "createdAt": "string (ISO 8601 timestamp)",
      "updatedAt": "string (ISO 8601 timestamp)"
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Status Codes**:
- `200 OK`: Projects retrieved successfully (may be empty array)
- `401 Unauthorized`: Missing or invalid token

**Error Messages**:
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Query database for projects where:
   - `owner_id = userId` OR
   - Project has ProjectPermission entry with `user_id = userId`
3. Return list of projects

**Database Operations**:
- `SELECT` from `projects` table with JOIN to `project_permissions` table
- Filter by `owner_id = userId` OR `project_permissions.user_id = userId`

**Authorization Checks**: Token validation, user isolation (only return user's projects)

---

### POST /api/projects

**Description**: Create a new project for the authenticated user.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "name": "string (optional, default: 'New Project' or 'Project N')"
}
```

**Request Validation**:
- `name`: Optional, if not provided, generate default name (e.g., "New Project" or "Project 1", "Project 2", etc.)

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 201 Created)**:
```json
{
  "project": {
    "id": "uuid",
    "name": "string",
    "ownerId": "uuid",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Project name cannot be empty"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Status Codes**:
- `201 Created`: Project created successfully
- `400 Bad Request`: Invalid project name
- `401 Unauthorized`: Missing or invalid token

**Error Messages**:
- "Project name cannot be empty" - Project name is empty string
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. If name not provided, generate default name (check existing project names for user to avoid duplicates)
3. Validate name is not empty (if provided)
4. Create project record in database with name and ownerId
5. Create default database for the project (name: "default database", schema_definition: {"string_prop": "string"})
6. Return created project

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` to check existing project names (for default name generation)
- `INSERT` into `projects` table
- `INSERT` into `databases` table (default database)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, user is project owner (implicitly, as creator)

---

### GET /api/projects/:id

**Description**: Retrieve details of a specific project, including functions, permissions, and databases.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "project": {
    "id": "uuid",
    "name": "string",
    "ownerId": "uuid",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Access denied"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `200 OK`: Project retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have access to this project
- `404 Not Found`: Project does not exist or user does not have access

**Error Messages**:
- "Access denied" - User does not own project and does not have ProjectPermission
- "Project not found" - Project does not exist or user does not have access
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Query database for project with matching id
3. Verify user has access:
   - Check if `owner_id = userId` OR
   - Check if ProjectPermission exists with `project_id = id` AND `user_id = userId`
4. If no access, return 403 or 404
5. Return project details

**Database Operations**:
- `SELECT` from `projects` table by id
- `SELECT` from `project_permissions` table to verify access

**Authorization Checks**: Token validation, project ownership or ProjectPermission verification

---

### PUT /api/projects/:id

**Description**: Update (rename) a project. Only project owners can rename projects.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "name": "string (required, non-empty, max 255 characters)"
}
```

**Request Validation**:
- `name`: Required, must be non-empty string, max 255 characters

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "project": {
    "id": "uuid",
    "name": "string",
    "ownerId": "uuid",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Project name cannot be empty" | "Project name already exists"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can rename project"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `200 OK`: Project updated successfully
- `400 Bad Request`: Invalid project name (empty or duplicate)
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Project does not exist

**Error Messages**:
- "Project name cannot be empty" - Name is empty string
- "Project name already exists" - User already has a project with this name
- "Only project owner can rename project" - User is not the project owner
- "Project not found" - Project does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Query database for project with matching id
3. Verify user is project owner (`owner_id = userId`)
4. If not owner, return 403
5. Validate new name is not empty
6. Check if user already has a project with this name (excluding current project)
7. Update project name in database
8. Return updated project

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table by id
- `SELECT` to check for duplicate project names for user
- `UPDATE` `projects` table (name, updated_at)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can rename)

---

### DELETE /api/projects/:id

**Description**: Delete a project and all associated data (functions, permissions, databases, instances, bricks, connections). Only project owners can delete projects.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `id` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "message": "Project deleted successfully"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can delete project"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `200 OK`: Project deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Project does not exist

**Error Messages**:
- "Only project owner can delete project" - User is not the project owner
- "Project not found" - Project does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Query database for project with matching id
3. Verify user is project owner (`owner_id = userId`)
4. If not owner, return 403
5. Delete all associated data in transaction:
   - Delete all BrickConnections for bricks in project's functions
   - Delete all FunctionBricks for project's functions
   - Delete all Functions for project
   - Delete all ProjectPermissions for project
   - Delete all DatabaseInstances for project's databases
   - Delete all Databases for project
   - Delete Project
6. Return success message

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table by id
- `DELETE` from `brick_connections` (via function_bricks)
- `DELETE` from `function_bricks` (via functions)
- `DELETE` from `functions` (where project_id = id)
- `DELETE` from `project_permissions` (where project_id = id)
- `DELETE` from `database_instances` (via databases)
- `DELETE` from `databases` (where project_id = id)
- `DELETE` from `projects` (where id = id)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can delete)

---

## Function APIs

### GET /api/projects/:projectId/functions

**Description**: Retrieve list of all functions within a specific project.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "functions": [
    {
      "id": "uuid",
      "name": "string",
      "projectId": "uuid",
      "createdAt": "string (ISO 8601 timestamp)",
      "updatedAt": "string (ISO 8601 timestamp)"
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Access denied"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `200 OK`: Functions retrieved successfully (may be empty array)
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have access to this project
- `404 Not Found`: Project does not exist or user does not have access

**Error Messages**:
- "Access denied" - User does not own project and does not have ProjectPermission
- "Project not found" - Project does not exist or user does not have access
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user has access to project (ownership or ProjectPermission)
3. Query database for all functions where `project_id = projectId`
4. Return list of functions

**Database Operations**:
- `SELECT` from `projects` table to verify access
- `SELECT` from `project_permissions` table to verify access
- `SELECT` from `functions` table (where project_id = projectId)

**Authorization Checks**: Token validation, project access verification

---

### POST /api/projects/:projectId/functions

**Description**: Create a new function within a project. Only project owners can create functions.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "name": "string (optional, default: 'New Function' or 'Function N')"
}
```

**Request Validation**:
- `name`: Optional, if not provided, generate default name (e.g., "New Function" or "Function 1", "Function 2", etc.)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 201 Created)**:
```json
{
  "function": {
    "id": "uuid",
    "name": "string",
    "projectId": "uuid",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Function name cannot be empty"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can create functions"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `201 Created`: Function created successfully
- `400 Bad Request`: Invalid function name
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Project does not exist

**Error Messages**:
- "Function name cannot be empty" - Name is empty string
- "Only project owner can create functions" - User is not the project owner
- "Project not found" - Project does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. If name not provided, generate default name (check existing function names in project)
4. Validate name is not empty (if provided)
5. Create function record in database with name and projectId
6. Return created function

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` to check existing function names (for default name generation)
- `INSERT` into `functions` table
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can create functions)

---

### GET /api/projects/:projectId/functions/:id

**Description**: Retrieve details of a specific function, including all bricks and connections.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "function": {
    "id": "uuid",
    "name": "string",
    "projectId": "uuid",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)",
    "bricks": [
      {
        "id": "uuid",
        "brickType": "string",
        "positionX": "integer",
        "positionY": "integer",
        "configuration": "object"
      }
    ],
    "connections": [
      {
        "id": "uuid",
        "fromBrickId": "uuid",
        "fromOutputName": "string",
        "toBrickId": "uuid",
        "toInputName": "string"
      }
    ]
  }
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Access denied"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Function not found"
}
```

**Status Codes**:
- `200 OK`: Function retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have access to this project
- `404 Not Found`: Function does not exist or user does not have access

**Error Messages**:
- "Access denied" - User does not own project and does not have ProjectPermission
- "Function not found" - Function does not exist or user does not have access
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user has access to project (ownership or ProjectPermission)
3. Query database for function with matching id and projectId
4. Query all FunctionBricks for this function
5. Query all BrickConnections for bricks in this function
6. Return function with bricks and connections

**Database Operations**:
- `SELECT` from `projects` table to verify access
- `SELECT` from `project_permissions` table to verify access
- `SELECT` from `functions` table (where id = id AND project_id = projectId)
- `SELECT` from `function_bricks` table (where function_id = id)
- `SELECT` from `brick_connections` table (where from_brick_id IN (...) OR to_brick_id IN (...))

**Authorization Checks**: Token validation, project access verification

---

### PUT /api/projects/:projectId/functions/:id

**Description**: Update (rename) a function. Only project owners can rename functions.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "name": "string (required, non-empty, max 255 characters)"
}
```

**Request Validation**:
- `name`: Required, must be non-empty string, max 255 characters

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "function": {
    "id": "uuid",
    "name": "string",
    "projectId": "uuid",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Function name cannot be empty" | "Function name already exists"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can rename functions"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Function not found"
}
```

**Status Codes**:
- `200 OK`: Function updated successfully
- `400 Bad Request`: Invalid function name (empty or duplicate)
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Function does not exist

**Error Messages**:
- "Function name cannot be empty" - Name is empty string
- "Function name already exists" - Project already has a function with this name
- "Only project owner can rename functions" - User is not the project owner
- "Function not found" - Function does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for function with matching id and projectId
4. Validate new name is not empty
5. Check if project already has a function with this name (excluding current function)
6. Update function name in database
7. Return updated function

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `functions` table by id and projectId
- `SELECT` to check for duplicate function names in project
- `UPDATE` `functions` table (name, updated_at)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can rename)

---

### DELETE /api/projects/:projectId/functions/:id

**Description**: Delete a function and all associated bricks and connections. Only project owners can delete functions.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "message": "Function deleted successfully"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can delete functions"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Function not found"
}
```

**Status Codes**:
- `200 OK`: Function deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Function does not exist

**Error Messages**:
- "Only project owner can delete functions" - User is not the project owner
- "Function not found" - Function does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for function with matching id and projectId
4. Delete all associated data in transaction:
   - Delete all BrickConnections for this function's bricks
   - Delete all FunctionBricks for this function
   - Delete Function
5. Return success message

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `functions` table by id and projectId
- `DELETE` from `brick_connections` (where from_brick_id IN (...) OR to_brick_id IN (...))
- `DELETE` from `function_bricks` (where function_id = id)
- `DELETE` from `functions` (where id = id)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can delete)

---

## Permission APIs

### GET /api/projects/:projectId/permissions

**Description**: Retrieve list of all users who have access to a project (project owner and users with permissions).

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "string",
      "isOwner": "boolean"
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Access denied"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `200 OK`: Permissions retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have access to this project
- `404 Not Found`: Project does not exist or user does not have access

**Error Messages**:
- "Access denied" - User does not own project and does not have ProjectPermission
- "Project not found" - Project does not exist or user does not have access
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user has access to project (ownership or ProjectPermission)
3. Query database for project owner (from projects table)
4. Query database for all users with ProjectPermission for this project
5. Combine results, marking owner with `isOwner: true`
6. Return list of users

**Database Operations**:
- `SELECT` from `projects` table to verify access and get owner
- `SELECT` from `project_permissions` table (where project_id = projectId)
- `SELECT` from `users` table (JOIN with project_permissions and projects)

**Authorization Checks**: Token validation, project access verification

---

### POST /api/projects/:projectId/permissions

**Description**: Add a user to the project's permission list. Only project owners can add permissions.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "email": "string (required, valid email format)"
}
```

**Request Validation**:
- `email`: Required, must be valid email format, must be registered user

**Path Parameters**:
- `projectId` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 201 Created)**:
```json
{
  "permission": {
    "id": "uuid",
    "projectId": "uuid",
    "userId": "uuid",
    "userEmail": "string",
    "createdAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Invalid email format" | "User not registered" | "User already has permissions"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can add users"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `201 Created`: Permission added successfully
- `400 Bad Request`: Invalid email format, user not registered, or user already has permissions
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Project does not exist

**Error Messages**:
- "Invalid email format" - Email does not match valid email pattern
- "User not registered" - Email does not exist in users table
- "User already has permissions" - ProjectPermission already exists for this user and project
- "Only project owner can add users" - User is not the project owner
- "Project not found" - Project does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Validate email format
4. Query database for user with matching email
5. If user not found, return 400 error
6. Check if ProjectPermission already exists for this user and project
7. If permission exists, return 400 error
8. Create ProjectPermission record in database
9. Return created permission with user information

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `users` table by email
- `SELECT` from `project_permissions` table to check for existing permission
- `INSERT` into `project_permissions` table
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can add permissions)

---

## Database APIs

### GET /api/projects/:projectId/databases

**Description**: Retrieve list of all databases within a project (including default database).

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "databases": [
    {
      "id": "uuid",
      "name": "string",
      "projectId": "uuid",
      "schemaDefinition": "object",
      "createdAt": "string (ISO 8601 timestamp)",
      "updatedAt": "string (ISO 8601 timestamp)"
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Access denied"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Project not found"
}
```

**Status Codes**:
- `200 OK`: Databases retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have access to this project
- `404 Not Found`: Project does not exist or user does not have access

**Error Messages**:
- "Access denied" - User does not own project and does not have ProjectPermission
- "Project not found" - Project does not exist or user does not have access
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user has access to project (ownership or ProjectPermission)
3. Query database for all databases where `project_id = projectId`
4. Return list of databases (default database is always included)

**Database Operations**:
- `SELECT` from `projects` table to verify access
- `SELECT` from `project_permissions` table to verify access
- `SELECT` from `databases` table (where project_id = projectId)

**Authorization Checks**: Token validation, project access verification

---

### GET /api/projects/:projectId/databases/:id/instances

**Description**: Retrieve list of all instances for a specific database. Supports pagination.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Query Parameters**:
- `page` (integer, optional, default: 1): Page number for pagination
- `limit` (integer, optional, default: 100, max: 100): Number of instances per page

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Database identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "instances": [
    {
      "id": "uuid",
      "databaseId": "uuid",
      "dataValues": "object",
      "createdAt": "string (ISO 8601 timestamp)",
      "updatedAt": "string (ISO 8601 timestamp)"
    }
  ],
  "pagination": {
    "page": "integer",
    "limit": "integer",
    "total": "integer",
    "totalPages": "integer"
  }
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Access denied"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Database not found"
}
```

**Status Codes**:
- `200 OK`: Instances retrieved successfully
- `400 Bad Request`: Invalid pagination parameters
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have access to this project
- `404 Not Found`: Database does not exist or user does not have access

**Error Messages**:
- "Access denied" - User does not own project and does not have ProjectPermission
- "Database not found" - Database does not exist or user does not have access
- "Invalid pagination parameters" - Page or limit values are invalid
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user has access to project (ownership or ProjectPermission)
3. Query database for database with matching id and projectId
4. Validate pagination parameters (page >= 1, limit >= 1 and <= 100)
5. Query database instances with pagination (LIMIT and OFFSET)
6. Count total instances for pagination metadata
7. Return instances with pagination information

**Database Operations**:
- `SELECT` from `projects` table to verify access
- `SELECT` from `project_permissions` table to verify access
- `SELECT` from `databases` table (where id = id AND project_id = projectId)
- `SELECT` from `database_instances` table with LIMIT and OFFSET
- `SELECT COUNT(*)` from `database_instances` table

**Authorization Checks**: Token validation, project access verification

---

### POST /api/projects/:projectId/databases/:id/instances

**Description**: Create a new instance of a database with property values. Only project owners can create instances.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "dataValues": "object (required, must match database schema_definition)"
}
```

**Request Validation**:
- `dataValues`: Required, must be valid JSON object
- `dataValues` must match the database's `schema_definition` structure
- For default database: must contain `string_prop` field with string value

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Database identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 201 Created)**:
```json
{
  "instance": {
    "id": "uuid",
    "databaseId": "uuid",
    "dataValues": "object",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Data values required" | "Data values do not match schema" | "String property value required"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can create instances"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Database not found"
}
```

**Status Codes**:
- `201 Created`: Instance created successfully
- `400 Bad Request`: Invalid data values or missing required properties
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Database does not exist

**Error Messages**:
- "Data values required" - dataValues field is missing or null
- "Data values do not match schema" - dataValues structure does not match schema_definition
- "String property value required" - For default database, string_prop is missing or empty
- "Only project owner can create instances" - User is not the project owner
- "Database not found" - Database does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for database with matching id and projectId
4. Validate dataValues is provided and is valid JSON object
5. Validate dataValues structure matches database's schema_definition
6. For default database, ensure string_prop is present and non-empty
7. Create DatabaseInstance record in database
8. Return created instance

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `databases` table (where id = id AND project_id = projectId)
- `INSERT` into `database_instances` table
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can create instances)

---

## Function Execution API

### POST /api/projects/:projectId/functions/:id/execute

**Description**: Execute a function's visual programming logic. Validates all brick connections and configurations, then executes the logic and returns console output.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "consoleOutput": [
    {
      "type": "string ('log' | 'error')",
      "message": "string",
      "timestamp": "string (ISO 8601 timestamp)"
    }
  ],
  "executionTime": "integer (milliseconds)"
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Brick connections incomplete" | "Brick input not configured" | "Invalid brick configuration"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Access denied"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Function not found"
}
```

**Response Schema (Error - 500 Internal Server Error)**:
```json
{
  "error": "Execution failed"
}
```

**Status Codes**:
- `200 OK`: Function executed successfully
- `400 Bad Request`: Invalid function configuration (missing connections, unconfigured inputs)
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have access to this project
- `404 Not Found`: Function does not exist
- `500 Internal Server Error`: Runtime error during execution

**Error Messages**:
- "Brick connections incomplete" - Required inputs are not connected to outputs
- "Brick input not configured" - Required configuration values are missing (e.g., database name for "ListInstancesByDBName")
- "Invalid brick configuration" - Configuration values are invalid (e.g., database does not exist)
- "Access denied" - User does not own project and does not have ProjectPermission
- "Function not found" - Function does not exist
- "Execution failed" - Runtime error occurred during execution
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user has access to project (ownership or ProjectPermission)
3. Load function with all bricks and connections
4. Validate function configuration:
   - All required brick inputs are connected (where required)
   - All required brick inputs are configured (e.g., "Name of DB" for "ListInstancesByDBName")
   - No circular dependencies in connections
   - Output types match input types for all connections
5. If validation fails, return 400 error
6. Execute function logic:
   - Build execution graph from connections
   - Execute bricks in topological order
   - For "ListInstancesByDBName": Query database instances by database name
   - For "GetFirstInstance": Get first instance from list
   - For "LogInstanceProps": Extract and log object properties to console
7. Collect console output from "LogInstanceProps" bricks
8. Return console output and execution time

**Database Operations**:
- `SELECT` from `projects` table to verify access
- `SELECT` from `project_permissions` table to verify access
- `SELECT` from `functions` table
- `SELECT` from `function_bricks` table
- `SELECT` from `brick_connections` table
- `SELECT` from `databases` table (for "ListInstancesByDBName" execution)
- `SELECT` from `database_instances` table (for "ListInstancesByDBName" execution)

**Authorization Checks**: Token validation, project access verification

---

## Brick APIs

### POST /api/projects/:projectId/functions/:id/bricks

**Description**: Add a brick to a function. Only project owners can add bricks.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "brickType": "string (required, one of: 'ListInstancesByDBName', 'GetFirstInstance', 'LogInstanceProps')",
  "positionX": "integer (required, grid X coordinate)",
  "positionY": "integer (required, grid Y coordinate)",
  "configuration": "object (optional, brick-specific configuration)"
}
```

**Request Validation**:
- `brickType`: Required, must be one of: "ListInstancesByDBName", "GetFirstInstance", "LogInstanceProps"
- `positionX`: Required, must be non-negative integer
- `positionY`: Required, must be non-negative integer
- `configuration`: Optional, JSON object (e.g., {"databaseName": "default database"} for "ListInstancesByDBName")

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 201 Created)**:
```json
{
  "brick": {
    "id": "uuid",
    "brickType": "string",
    "positionX": "integer",
    "positionY": "integer",
    "configuration": "object",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Invalid brick type" | "Position coordinates required" | "Invalid configuration"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can add bricks"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Function not found"
}
```

**Status Codes**:
- `201 Created`: Brick added successfully
- `400 Bad Request`: Invalid brick type, position, or configuration
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Function does not exist

**Error Messages**:
- "Invalid brick type" - brickType is not one of the allowed values
- "Position coordinates required" - positionX or positionY is missing
- "Invalid configuration" - Configuration does not match expected format for brick type
- "Only project owner can add bricks" - User is not the project owner
- "Function not found" - Function does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for function with matching id and projectId
4. Validate brickType is one of allowed values
5. Validate position coordinates are non-negative integers
6. Validate configuration (if provided) matches expected format for brick type
7. Create FunctionBrick record in database
8. Return created brick

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `functions` table by id and projectId
- `INSERT` into `function_bricks` table
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can add bricks)

---

### PUT /api/projects/:projectId/functions/:id/bricks/:brickId

**Description**: Update a brick's configuration or position. Only project owners can update bricks.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "positionX": "integer (optional, grid X coordinate)",
  "positionY": "integer (optional, grid Y coordinate)",
  "configuration": "object (optional, brick-specific configuration)"
}
```

**Request Validation**:
- `positionX`: Optional, if provided must be non-negative integer
- `positionY`: Optional, if provided must be non-negative integer
- `configuration`: Optional, JSON object (must match expected format for brick type)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier
- `brickId` (UUID, required): Brick identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "brick": {
    "id": "uuid",
    "brickType": "string",
    "positionX": "integer",
    "positionY": "integer",
    "configuration": "object",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Invalid position coordinates" | "Invalid configuration"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can update bricks"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Brick not found"
}
```

**Status Codes**:
- `200 OK`: Brick updated successfully
- `400 Bad Request`: Invalid position or configuration
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Brick does not exist

**Error Messages**:
- "Invalid position coordinates" - positionX or positionY is negative
- "Invalid configuration" - Configuration does not match expected format for brick type
- "Only project owner can update bricks" - User is not the project owner
- "Brick not found" - Brick does not exist or does not belong to function
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for brick with matching brickId and functionId
4. Validate position coordinates (if provided) are non-negative integers
5. Validate configuration (if provided) matches expected format for brick type
6. Update FunctionBrick record in database (positionX, positionY, configuration, updated_at)
7. Return updated brick

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `functions` table by id and projectId
- `SELECT` from `function_bricks` table by brickId and functionId
- `UPDATE` `function_bricks` table (position_x, position_y, configuration, updated_at)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can update bricks)

---

### DELETE /api/projects/:projectId/functions/:id/bricks/:brickId

**Description**: Remove a brick from a function. All connections involving this brick are also deleted. Only project owners can delete bricks.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier
- `brickId` (UUID, required): Brick identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "message": "Brick deleted successfully"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can delete bricks"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Brick not found"
}
```

**Status Codes**:
- `200 OK`: Brick deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Brick does not exist

**Error Messages**:
- "Only project owner can delete bricks" - User is not the project owner
- "Brick not found" - Brick does not exist or does not belong to function
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for brick with matching brickId and functionId
4. Delete all BrickConnections involving this brick (as source or target)
5. Delete FunctionBrick record
6. Return success message

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `functions` table by id and projectId
- `SELECT` from `function_bricks` table by brickId and functionId
- `DELETE` from `brick_connections` (where from_brick_id = brickId OR to_brick_id = brickId)
- `DELETE` from `function_bricks` (where id = brickId)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can delete bricks)

---

## Connection APIs

### POST /api/projects/:projectId/functions/:id/connections

**Description**: Create a connection between two bricks, linking an output of one brick to an input of another. Only project owners can create connections.

**Authentication**: Required (JWT token)

**Request Schema**:
```json
{
  "fromBrickId": "uuid (required, source brick identifier)",
  "fromOutputName": "string (required, output port name, e.g., 'List', 'DB', 'value')",
  "toBrickId": "uuid (required, target brick identifier)",
  "toInputName": "string (required, input port name, e.g., 'Name of DB', 'List', 'Object')"
}
```

**Request Validation**:
- `fromBrickId`: Required, must be UUID of existing brick in function
- `fromOutputName`: Required, must be valid output name for source brick type
- `toBrickId`: Required, must be UUID of existing brick in function
- `toInputName`: Required, must be valid input name for target brick type
- Both bricks must belong to the same function
- Output type must match input type
- Each input can only have one connection (unique constraint)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 201 Created)**:
```json
{
  "connection": {
    "id": "uuid",
    "fromBrickId": "uuid",
    "fromOutputName": "string",
    "toBrickId": "uuid",
    "toInputName": "string",
    "createdAt": "string (ISO 8601 timestamp)"
  }
}
```

**Response Schema (Error - 400 Bad Request)**:
```json
{
  "error": "Output type does not match input type" | "Circular connection not allowed" | "Input already connected" | "Invalid brick reference"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can create connections"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Function not found" | "Brick not found"
}
```

**Status Codes**:
- `201 Created`: Connection created successfully
- `400 Bad Request`: Invalid connection (type mismatch, circular dependency, input already connected)
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Function or brick does not exist

**Error Messages**:
- "Output type does not match input type" - Output type from source brick does not match input type of target brick
- "Circular connection not allowed" - Connection would create a circular dependency in the execution graph
- "Input already connected" - Target input already has a connection (each input can only have one connection)
- "Invalid brick reference" - One or both bricks do not exist or do not belong to function
- "Only project owner can create connections" - User is not the project owner
- "Function not found" - Function does not exist
- "Brick not found" - Brick does not exist
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for function with matching id and projectId
4. Query database for both bricks (fromBrickId and toBrickId) and verify they belong to function
5. Validate output type matches input type for the connection
6. Check if target input already has a connection (unique constraint)
7. Validate no circular dependencies would be created (build graph and check for cycles)
8. Create BrickConnection record in database
9. Return created connection

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `functions` table by id and projectId
- `SELECT` from `function_bricks` table for both bricks
- `SELECT` from `brick_connections` table to check for existing connection to target input
- `SELECT` from `brick_connections` table to build graph for cycle detection
- `INSERT` into `brick_connections` table
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can create connections)

---

### DELETE /api/projects/:projectId/functions/:id/connections/:connectionId

**Description**: Delete a connection between two bricks. Only project owners can delete connections.

**Authentication**: Required (JWT token)

**Request Schema**: None (no request body)

**Path Parameters**:
- `projectId` (UUID, required): Project identifier
- `id` (UUID, required): Function identifier
- `connectionId` (UUID, required): Connection identifier

**Request Headers**:
- `Authorization: Bearer <token>` (required)

**Response Schema (Success - 200 OK)**:
```json
{
  "message": "Connection deleted successfully"
}
```

**Response Schema (Error - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized" | "Token expired"
}
```

**Response Schema (Error - 403 Forbidden)**:
```json
{
  "error": "Only project owner can delete connections"
}
```

**Response Schema (Error - 404 Not Found)**:
```json
{
  "error": "Connection not found"
}
```

**Status Codes**:
- `200 OK`: Connection deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not project owner
- `404 Not Found`: Connection does not exist

**Error Messages**:
- "Only project owner can delete connections" - User is not the project owner
- "Connection not found" - Connection does not exist or does not belong to function
- "Unauthorized" - Token missing or invalid
- "Token expired" - Token has expired

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify user is project owner (`owner_id = userId`)
3. Query database for function with matching id and projectId
4. Query database for connection with matching connectionId and verify it belongs to function's bricks
5. Delete BrickConnection record
6. Return success message

**Database Operations**:
- `BEGIN TRANSACTION`
- `SELECT` from `projects` table to verify ownership
- `SELECT` from `functions` table by id and projectId
- `SELECT` from `brick_connections` table by connectionId (JOIN with function_bricks to verify function)
- `DELETE` from `brick_connections` table (where id = connectionId)
- `COMMIT TRANSACTION`
- Rollback on error

**Authorization Checks**: Token validation, project ownership verification (only owners can delete connections)

---

## Logging and Error Handling

### Error Logging Format

All errors must be logged using the following format:
```
[ERROR] <timestamp> <endpoint> <user_id> <error_message> <stack_trace>
```

Example:
```
[ERROR] 2024-01-15T10:30:45Z POST /api/projects 550e8400-e29b-41d4-a716-446655440000 "Project creation failed" "Error: ...\n    at ..."
```

### HTTP Status Codes

Standard HTTP status codes used across all APIs:
- `200 OK`: Successful GET, PUT, DELETE operations
- `201 Created`: Successful POST operations that create resources
- `400 Bad Request`: Invalid request data, validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks permission for the requested operation
- `404 Not Found`: Resource does not exist or user does not have access
- `500 Internal Server Error`: Server-side errors (never expose internal details to client)

### Error Response Format

All error responses follow this consistent JSON format:
```json
{
  "error": "User-friendly error message"
}
```

### User-Facing vs Technical Error Messages

- **User-facing messages**: Displayed to end users in the UI, must be clear and actionable
- **Technical messages**: Logged server-side with full context (stack traces, internal details)
- Never expose technical error details (database errors, stack traces) to clients in production
- Use generic error messages for security-sensitive operations (e.g., "Invalid email or password" instead of "User not found" or "Password incorrect")

### Transaction Management for Write Operations

All write operations (POST, PUT, DELETE) must:
1. Begin a database transaction
2. Perform all database operations within the transaction
3. Commit transaction on success
4. Rollback transaction on any error
5. Log errors with full context before returning error response

Example pattern:
```typescript
BEGIN TRANSACTION
try {
  // Database operations
  COMMIT TRANSACTION
} catch (error) {
  ROLLBACK TRANSACTION
  // Log error
  // Return error response
}
```

# POST /api/v1/projects

## Endpoint
`POST /api/v1/projects`

## Description
Creates a new project with a default name. The authenticated user becomes the owner of the project. This endpoint is called when a user drags the "Project" brick to the project list area.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Body
```json
{
  "name": "string (optional)"
}
```

### Field Validation
- **name**: 
  - Required: No (defaults to "New Project" if not provided)
  - Type: String
  - Min length: 1 character
  - Max length: 255 characters
  - Example: "My New Project"

## Response Schema

### Success Response (201 Created)
```json
{
  "project": {
    "id": "uuid",
    "name": "string",
    "ownerId": "uuid",
    "createdAt": "iso8601-timestamp",
    "updatedAt": "iso8601-timestamp"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Project Name
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project name",
    "details": {
      "field": "name",
      "validationErrors": [
        {
          "field": "name",
          "message": "Project name must be between 1 and 255 characters"
        }
      ]
    }
  }
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "details": {}
  }
}
```

## Status Codes
- **201 Created**: Project created successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid or missing token
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project name (if provided)
4. Set default name "New Project" if name not provided
5. Create project record in database with:
   - Generated UUID
   - Name (provided or default)
   - Owner ID (from token)
   - Created at timestamp
   - Updated at timestamp
6. Return created project

## Authorization Rules
- User must be authenticated
- Authenticated user automatically becomes project owner
- No additional permissions required to create projects

## Request Example
```json
POST /api/v1/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "My New Project"
}
```

## Response Example (Success)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My New Project",
    "ownerId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-15T10:30:45.123Z",
    "updatedAt": "2024-01-15T10:30:45.123Z"
  }
}
```

## Response Example (Success with Default Name)
```json
POST /api/v1/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Project",
    "ownerId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-15T10:30:45.123Z",
    "updatedAt": "2024-01-15T10:30:45.123Z"
  }
}
```

## Response Example (Error - Invalid Name)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project name",
    "details": {
      "field": "name",
      "validationErrors": [
        {
          "field": "name",
          "message": "Project name must be between 1 and 255 characters"
        }
      ]
    }
  }
}
```

## Related Use Cases
- Create Project (from 03-functional-requirements.md)

## Notes
- Default name "New Project" is used when name is not provided
- Project is immediately available after creation
- Owner ID is set from authenticated user's token
- Response time should be < 300ms (POST request performance requirement)
- Project creation is idempotent in terms of user action (drag-and-drop creates one project)

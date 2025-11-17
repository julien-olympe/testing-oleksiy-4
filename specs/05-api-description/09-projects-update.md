# PUT /api/v1/projects/:id

## Endpoint
`PUT /api/v1/projects/:id`

## Description
Updates a project's name. The user must own the project or have permission to modify it. This endpoint is called when a user renames a project.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Path Parameters
- **id**: Project UUID
  - Type: UUID
  - Required: Yes
  - Example: "550e8400-e29b-41d4-a716-446655440000"

### Body
```json
{
  "name": "string (required)"
}
```

### Field Validation
- **name**: 
  - Required: Yes
  - Type: String
  - Min length: 1 character
  - Max length: 255 characters
  - Example: "Renamed Project"

## Response Schema

### Success Response (200 OK)
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

#### 400 Bad Request - Required Field Missing
```json
{
  "error": {
    "code": "REQUIRED_FIELD_MISSING",
    "message": "Required field is missing",
    "details": {
      "field": "name",
      "validationErrors": [
        {
          "field": "name",
          "message": "Name is required"
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

#### 403 Forbidden - Permission Denied
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to modify this project",
    "details": {}
  }
}
```

#### 404 Not Found - Project Not Found
```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found",
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
- **200 OK**: Project updated successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to modify project
- **404 Not Found**: Project does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Validate project name (required, 1-255 characters)
5. Query project from database by ID
6. If project not found, return 404
7. Check if user is owner OR has permission
8. If user lacks access, return 403
9. Update project name in database
10. Update updated_at timestamp
11. Return updated project

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before update

## Request Example
```json
PUT /api/v1/projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Renamed Project"
}
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Renamed Project",
    "ownerId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-15T10:30:45.123Z",
    "updatedAt": "2024-01-15T11:45:30.789Z"
  }
}
```

## Response Example (Error - Permission Denied)
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to modify this project",
    "details": {}
  }
}
```

## Related Use Cases
- Rename Project (from 03-functional-requirements.md)

## Notes
- Only project name can be updated via this endpoint
- Updated timestamp is automatically set
- Changes are persisted immediately (auto-save)
- Response time should be < 250ms (PUT request performance requirement)
- Project name validation ensures non-empty and reasonable length

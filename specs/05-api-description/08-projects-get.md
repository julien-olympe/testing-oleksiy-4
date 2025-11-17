# GET /api/v1/projects/:id

## Endpoint
`GET /api/v1/projects/:id`

## Description
Retrieves a single project by ID. The user must own the project or have permission to access it.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)

### Path Parameters
- **id**: Project UUID
  - Type: UUID
  - Required: Yes
  - Example: "550e8400-e29b-41d4-a716-446655440000"

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
    "message": "You don't have permission to access this project",
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

#### 400 Bad Request - Invalid UUID
```json
{
  "error": {
    "code": "INVALID_UUID_FORMAT",
    "message": "Invalid UUID format",
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
- **200 OK**: Project retrieved successfully
- **400 Bad Request**: Invalid UUID format
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to access project
- **404 Not Found**: Project does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Query project from database by ID
5. If project not found, return 404
6. Check if user is owner OR has permission
7. If user lacks access, return 403
8. Return project data

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Project",
    "ownerId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-15T10:30:45.123Z",
    "updatedAt": "2024-01-15T10:30:45.123Z"
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
    "message": "You don't have permission to access this project",
    "details": {}
  }
}
```

## Response Example (Error - Not Found)
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found",
    "details": {}
  }
}
```

## Related Use Cases
- Open Project Editor (from 03-functional-requirements.md)

## Notes
- Permission check is performed at database level using row-level security
- 404 is returned if project doesn't exist OR user lacks access (prevents enumeration)
- Response time should be < 200ms (GET request performance requirement)
- This endpoint is used to verify project access before opening editor

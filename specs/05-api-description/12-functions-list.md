# GET /api/v1/projects/:id/functions

## Endpoint
`GET /api/v1/projects/:id/functions`

## Description
Retrieves a list of all functions in a project. The user must own the project or have permission to access it.

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
  "functions": [
    {
      "id": "uuid",
      "name": "string",
      "projectId": "uuid",
      "createdAt": "iso8601-timestamp",
      "updatedAt": "iso8601-timestamp"
    }
  ]
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
- **200 OK**: Functions retrieved successfully
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
8. Query all functions for project
9. Order by created_at DESC (newest first)
10. Return functions list

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/functions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "functions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "My Function",
      "projectId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Another Function",
      "projectId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Related Use Cases
- View functions in Project Editor (from 04-screens.md)

## Notes
- Functions are ordered by creation date (newest first)
- Empty array returned if project has no functions
- Response time should be < 200ms (GET request performance requirement)
- This endpoint is used to display functions in the Project tab

# GET /api/v1/projects/:id/permissions

## Endpoint
`GET /api/v1/projects/:id/permissions`

## Description
Retrieves a list of all users who have permissions to access a project. The user must own the project or have permission to view it.

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
  "permissions": [
    {
      "userId": "uuid",
      "userEmail": "string",
      "createdAt": "iso8601-timestamp"
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
    "message": "You don't have permission to view permissions for this project",
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
- **200 OK**: Permissions retrieved successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to view permissions
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
8. Query all permissions for project
9. Join with user table to get user emails
10. Order by created_at ASC (oldest first)
11. Return permissions list with user emails

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/permissions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "permissions": [
    {
      "userId": "880e8400-e29b-41d4-a716-446655440003",
      "userEmail": "shared@example.com",
      "createdAt": "2024-01-15T11:30:00.000Z"
    },
    {
      "userId": "990e8400-e29b-41d4-a716-446655440004",
      "userEmail": "another@example.com",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

## Related Use Cases
- View Project Permissions (from 03-functional-requirements.md)

## Notes
- Permissions are ordered by creation date (oldest first)
- User emails are included for display in the Permissions tab
- Empty array returned if project has no permissions (only owner)
- Response time should be < 200ms (GET request performance requirement)
- This endpoint is used to display users in the Permissions tab

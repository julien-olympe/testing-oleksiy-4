# DELETE /api/v1/projects/:id/permissions/:userId

## Endpoint
`DELETE /api/v1/projects/:id/permissions/:userId`

## Description
Removes a permission for a user to access a project. The user must own the project or have permission to modify it. The project owner cannot remove their own ownership.

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

- **userId**: User UUID
  - Type: UUID
  - Required: Yes
  - Example: "880e8400-e29b-41d4-a716-446655440003"

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "message": "Permission removed successfully"
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
    "message": "You don't have permission to remove permissions for this project",
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

#### 404 Not Found - Permission Not Found
```json
{
  "error": {
    "code": "PERMISSION_NOT_FOUND",
    "message": "Permission not found",
    "details": {}
  }
}
```

#### 400 Bad Request - Cannot Remove Owner
```json
{
  "error": {
    "code": "CANNOT_REMOVE_OWNER",
    "message": "Cannot remove project owner permission",
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
- **200 OK**: Permission removed successfully
- **400 Bad Request**: Cannot remove owner permission
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to remove permissions
- **404 Not Found**: Project or permission does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Validate user ID is valid UUID
5. Query project from database by ID
6. If project not found, return 404
7. Check if user is owner OR has permission
8. If user lacks access, return 403
9. Check if target user is project owner
10. If target user is owner, return 400 Cannot Remove Owner
11. Query permission from database (project_id, user_id)
12. If permission not found, return 404
13. Delete permission record
14. Return success message

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before deletion
- Project owner cannot be removed

## Request Example
```json
DELETE /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/permissions/880e8400-e29b-41d4-a716-446655440003
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Permission removed successfully"
}
```

## Response Example (Error - Cannot Remove Owner)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "CANNOT_REMOVE_OWNER",
    "message": "Cannot remove project owner permission",
    "details": {}
  }
}
```

## Related Use Cases
- Remove project permission (implied from Add Project Permission use case)

## Notes
- Project owner permission cannot be removed
- Permission removal is immediate
- User loses access to project after permission removal
- Response time should be < 200ms (DELETE request performance requirement)
- Deletion is logged for audit purposes

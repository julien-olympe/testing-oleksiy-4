# DELETE /api/v1/projects/:id

## Endpoint
`DELETE /api/v1/projects/:id`

## Description
Deletes a project and all associated data (functions, bricks, connections, permissions, database instances). The user must own the project. This operation is irreversible.

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

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "message": "Project deleted successfully"
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
    "message": "You don't have permission to delete this project",
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
- **200 OK**: Project deleted successfully
- **400 Bad Request**: Invalid UUID format
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to delete project
- **404 Not Found**: Project does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Query project from database by ID
5. If project not found, return 404
6. Check if user is owner (only owners can delete)
7. If user is not owner, return 403
8. Begin database transaction
9. Delete all related data in order:
   - Brick connections (via bricks)
   - Bricks (via functions)
   - Functions
   - Database instance values
   - Database instances
   - Project permissions
   - Project
10. Commit transaction
11. If any error occurs, rollback transaction
12. Return success message

## Authorization Rules
- User must be authenticated
- User must be project owner (permission holders cannot delete)
- Ownership verification required before deletion

## Request Example
```json
DELETE /api/v1/projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Project deleted successfully"
}
```

## Response Example (Error - Permission Denied)
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to delete this project",
    "details": {}
  }
}
```

## Related Use Cases
- Delete Project (from 03-functional-requirements.md)

## Notes
- Deletion is cascading (all related data deleted)
- Operation is irreversible
- Only project owners can delete projects
- Transaction ensures atomicity (all-or-nothing deletion)
- Foreign key constraints with CASCADE DELETE handle related data
- Response time should be < 200ms (DELETE request performance requirement)
- Deletion is logged for audit purposes

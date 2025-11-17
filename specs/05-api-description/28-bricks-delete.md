# DELETE /api/v1/bricks/:id

## Endpoint
`DELETE /api/v1/bricks/:id`

## Description
Deletes a brick and all associated connections. The user must own the project containing the function or have permission to modify it. This operation is irreversible.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)

### Path Parameters
- **id**: Brick UUID
  - Type: UUID
  - Required: Yes
  - Example: "cc0e8400-e29b-41d4-a716-446655440007"

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "message": "Brick deleted successfully"
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
    "message": "You don't have permission to delete this brick",
    "details": {}
  }
}
```

#### 404 Not Found - Brick Not Found
```json
{
  "error": {
    "code": "BRICK_NOT_FOUND",
    "message": "Brick not found",
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
- **200 OK**: Brick deleted successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to delete brick
- **404 Not Found**: Brick does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate brick ID is valid UUID
4. Query brick from database by ID
5. If brick not found, return 404
6. Query function for brick
7. Query project for function
8. Check if user is project owner OR has permission
9. If user lacks access, return 403
10. Begin database transaction
11. Delete all connections where brick is source or target
12. Delete brick
13. Commit transaction
14. If any error occurs, rollback transaction
15. Return success message

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before deletion

## Request Example
```json
DELETE /api/v1/bricks/cc0e8400-e29b-41d4-a716-446655440007
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Brick deleted successfully"
}
```

## Related Use Cases
- Delete brick from Function Editor (implied from Add Brick use case)

## Notes
- Deletion is cascading (all connections deleted)
- Operation is irreversible
- Transaction ensures atomicity (all-or-nothing deletion)
- Foreign key constraints with CASCADE DELETE handle related data
- Response time should be < 200ms (DELETE request performance requirement)
- Deletion is logged for audit purposes

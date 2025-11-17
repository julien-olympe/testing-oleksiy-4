# DELETE /api/v1/functions/:id

## Endpoint
`DELETE /api/v1/functions/:id`

## Description
Deletes a function and all associated data (bricks, connections). The user must own the project containing the function or have permission to modify it. This operation is irreversible.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)

### Path Parameters
- **id**: Function UUID
  - Type: UUID
  - Required: Yes
  - Example: "770e8400-e29b-41d4-a716-446655440002"

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "message": "Function deleted successfully"
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
    "message": "You don't have permission to delete this function",
    "details": {}
  }
}
```

#### 404 Not Found - Function Not Found
```json
{
  "error": {
    "code": "FUNCTION_NOT_FOUND",
    "message": "Function not found",
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
- **200 OK**: Function deleted successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to delete function
- **404 Not Found**: Function does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate function ID is valid UUID
4. Query function from database by ID
5. If function not found, return 404
6. Query project for function
7. Check if user is project owner OR has permission
8. If user lacks access, return 403
9. Begin database transaction
10. Delete all related data in order:
    - Brick connections (where from_brick_id or to_brick_id references bricks in function)
    - Bricks (where function_id matches)
    - Function
11. Commit transaction
12. If any error occurs, rollback transaction
13. Return success message

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before deletion

## Request Example
```json
DELETE /api/v1/functions/770e8400-e29b-41d4-a716-446655440002
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Function deleted successfully"
}
```

## Response Example (Error - Permission Denied)
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to delete this function",
    "details": {}
  }
}
```

## Related Use Cases
- Delete Function (from 03-functional-requirements.md)

## Notes
- Deletion is cascading (all related bricks and connections deleted)
- Operation is irreversible
- Transaction ensures atomicity (all-or-nothing deletion)
- Foreign key constraints with CASCADE DELETE handle related data
- Response time should be < 200ms (DELETE request performance requirement)
- Deletion is logged for audit purposes

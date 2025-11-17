# DELETE /api/v1/projects/:id/databases/:databaseId/instances/:instanceId

## Endpoint
`DELETE /api/v1/projects/:id/databases/:databaseId/instances/:instanceId`

## Description
Deletes a database instance and all associated property values. The user must own the project or have permission to modify it. This operation is irreversible.

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

- **databaseId**: Database UUID
  - Type: UUID
  - Required: Yes
  - Example: "990e8400-e29b-41d4-a716-446655440004"

- **instanceId**: Instance UUID
  - Type: UUID
  - Required: Yes
  - Example: "bb0e8400-e29b-41d4-a716-446655440006"

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "message": "Instance deleted successfully"
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
    "message": "You don't have permission to delete instances in this project",
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

#### 404 Not Found - Instance Not Found
```json
{
  "error": {
    "code": "INSTANCE_NOT_FOUND",
    "message": "Instance not found",
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
- **200 OK**: Instance deleted successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to delete instances
- **404 Not Found**: Project or instance does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Validate database ID is valid UUID
5. Validate instance ID is valid UUID
6. Query project from database by ID
7. If project not found, return 404
8. Check if user is owner OR has permission
9. If user lacks access, return 403
10. Query instance from database by ID
11. If instance not found, return 404
12. Verify instance belongs to database
13. Begin database transaction
14. Delete all instance values (cascade)
15. Delete instance
16. Commit transaction
17. If any error occurs, rollback transaction
18. Return success message

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before deletion

## Request Example
```json
DELETE /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/databases/990e8400-e29b-41d4-a716-446655440004/instances/bb0e8400-e29b-41d4-a716-446655440006
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Instance deleted successfully"
}
```

## Related Use Cases
- Delete database instance (implied from Create Database Instance use case)

## Notes
- Deletion is cascading (all property values deleted)
- Operation is irreversible
- Transaction ensures atomicity (all-or-nothing deletion)
- Foreign key constraints with CASCADE DELETE handle related data
- Response time should be < 200ms (DELETE request performance requirement)
- Deletion is logged for audit purposes

# DELETE /api/v1/bricks/:fromBrickId/connections/:toBrickId

## Endpoint
`DELETE /api/v1/bricks/:fromBrickId/connections/:toBrickId`

## Description
Removes a connection (link) between two bricks. The user must own the project containing the function or have permission to modify it. This endpoint is called when a user deletes a connection line between bricks.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)

### Path Parameters
- **fromBrickId**: Source Brick UUID
  - Type: UUID
  - Required: Yes
  - Example: "cc0e8400-e29b-41d4-a716-446655440007"

- **toBrickId**: Target Brick UUID
  - Type: UUID
  - Required: Yes
  - Example: "dd0e8400-e29b-41d4-a716-446655440008"

### Query Parameters
- **fromOutputName** (optional): Output name on source brick
  - Type: String
  - Example: "List"

- **toInputName** (optional): Input name on target brick
  - Type: String
  - Example: "List"

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "message": "Connection removed successfully"
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
    "message": "You don't have permission to remove connections in this function",
    "details": {}
  }
}
```

#### 404 Not Found - Connection Not Found
```json
{
  "error": {
    "code": "CONNECTION_NOT_FOUND",
    "message": "Connection not found",
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
- **200 OK**: Connection removed successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to remove connections
- **404 Not Found**: Connection or brick does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate source brick ID is valid UUID
4. Validate target brick ID is valid UUID
5. Query source brick from database by ID
6. If source brick not found, return 404
7. Query target brick from database by ID
8. If target brick not found, return 404
9. Verify both bricks belong to same function
10. Query function for bricks
11. Query project for function
12. Check if user is project owner OR has permission
13. If user lacks access, return 403
14. Query connection from database (from_brick_id, to_brick_id, optionally from_output_name, to_input_name)
15. If connection not found, return 404
16. Delete connection record
17. Return success message

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before deletion

## Request Example
```json
DELETE /api/v1/bricks/cc0e8400-e29b-41d4-a716-446655440007/connections/dd0e8400-e29b-41d4-a716-446655440008?fromOutputName=List&toInputName=List
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Connection removed successfully"
}
```

## Related Use Cases
- Unlink bricks (implied from Link Bricks use case)

## Notes
- Connection is identified by source and target brick IDs
- Optional query parameters allow specifying exact output/input ports
- If multiple connections exist between same bricks, all are deleted (or specify ports to delete specific one)
- Changes are automatically persisted (auto-save)
- Response time should be < 200ms (DELETE request performance requirement)
- This endpoint is called when user deletes connection line between bricks

# POST /api/v1/bricks/:id/connections

## Endpoint
`POST /api/v1/bricks/:id/connections`

## Description
Creates a connection (link) between two bricks. The connection links an output of the source brick to an input of the target brick. The user must own the project containing the function or have permission to modify it. This endpoint is called when a user drags a connection line from one brick's output to another brick's input.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Path Parameters
- **id**: Source Brick UUID (from_brick_id)
  - Type: UUID
  - Required: Yes
  - Example: "cc0e8400-e29b-41d4-a716-446655440007"

### Body
```json
{
  "fromOutputName": "string (required)",
  "toBrickId": "uuid (required)",
  "toInputName": "string (required)"
}
```

### Field Validation
- **fromOutputName**: 
  - Required: Yes
  - Type: String
  - Min length: 1 character
  - Max length: 100 characters
  - Example: "List"

- **toBrickId**: 
  - Required: Yes
  - Type: UUID
  - Example: "dd0e8400-e29b-41d4-a716-446655440008"

- **toInputName**: 
  - Required: Yes
  - Type: String
  - Min length: 1 character
  - Max length: 100 characters
  - Example: "List"

## Response Schema

### Success Response (201 Created)
```json
{
  "connection": {
    "id": "uuid",
    "fromBrickId": "uuid",
    "fromOutputName": "string",
    "toBrickId": "uuid",
    "toInputName": "string",
    "createdAt": "iso8601-timestamp"
  }
}
```

### Error Responses

#### 400 Bad Request - Incompatible Types
```json
{
  "error": {
    "code": "INCOMPATIBLE_TYPES",
    "message": "Incompatible types between output and input",
    "details": {}
  }
}
```

#### 400 Bad Request - Link Already Exists
```json
{
  "error": {
    "code": "LINK_ALREADY_EXISTS",
    "message": "Link already exists",
    "details": {}
  }
}
```

#### 400 Bad Request - Invalid Connection
```json
{
  "error": {
    "code": "INVALID_BRICK_CONNECTION",
    "message": "Invalid brick connection",
    "details": {}
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
    "message": "You don't have permission to create connections in this function",
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
- **201 Created**: Connection created successfully
- **400 Bad Request**: Validation error, incompatible types, or link already exists
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to create connections
- **404 Not Found**: Brick does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate source brick ID is valid UUID
4. Validate target brick ID is valid UUID
5. Validate output and input names (required, 1-100 characters)
6. Query source brick from database by ID
7. If source brick not found, return 404
8. Query target brick from database by ID
9. If target brick not found, return 404
10. Verify both bricks belong to same function
11. If bricks in different functions, return 400 Invalid Connection
12. Query function for bricks
13. Query project for function
14. Check if user is project owner OR has permission
15. If user lacks access, return 403
16. Validate output/input types are compatible (business logic)
17. If types incompatible, return 400 Incompatible Types
18. Check if connection already exists (from_brick_id, from_output_name, to_brick_id, to_input_name)
19. If connection exists, return 400 Link Already Exists
20. Create connection record in database
21. Return created connection

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before creation

## Request Example
```json
POST /api/v1/bricks/cc0e8400-e29b-41d4-a716-446655440007/connections
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fromOutputName": "List",
  "toBrickId": "dd0e8400-e29b-41d4-a716-446655440008",
  "toInputName": "List"
}
```

## Response Example (Success)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "connection": {
    "id": "ee0e8400-e29b-41d4-a716-446655440009",
    "fromBrickId": "cc0e8400-e29b-41d4-a716-446655440007",
    "fromOutputName": "List",
    "toBrickId": "dd0e8400-e29b-41d4-a716-446655440008",
    "toInputName": "List",
    "createdAt": "2024-01-15T12:10:00.000Z"
  }
}
```

## Response Example (Error - Link Already Exists)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "LINK_ALREADY_EXISTS",
    "message": "Link already exists",
    "details": {}
  }
}
```

## Related Use Cases
- Link Bricks (from 03-functional-requirements.md)

## Notes
- Connection validates type compatibility between output and input
- Duplicate connections are prevented by unique constraint
- Both bricks must belong to the same function
- Changes are automatically persisted (auto-save)
- Response time should be < 300ms (POST request performance requirement)
- This endpoint is called when user creates connection line between bricks

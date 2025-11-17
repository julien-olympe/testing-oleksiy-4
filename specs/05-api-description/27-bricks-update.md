# PUT /api/v1/bricks/:id

## Endpoint
`PUT /api/v1/bricks/:id`

## Description
Updates a brick's position or configuration. The user must own the project containing the function or have permission to modify it. This endpoint is called when a user moves a brick or updates its configuration (e.g., sets database name input parameter).

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Path Parameters
- **id**: Brick UUID
  - Type: UUID
  - Required: Yes
  - Example: "cc0e8400-e29b-41d4-a716-446655440007"

### Body
```json
{
  "positionX": 0,
  "positionY": 0,
  "configuration": {}
}
```

### Field Validation
- **positionX**: 
  - Required: No (only if updating position)
  - Type: Integer
  - Min: 0
  - Max: 10000
  - Example: 200

- **positionY**: 
  - Required: No (only if updating position)
  - Type: Integer
  - Min: 0
  - Max: 10000
  - Example: 200

- **configuration**: 
  - Required: No (only if updating configuration)
  - Type: Object (JSONB)
  - Example: {"databaseName": "default database"}

## Response Schema

### Success Response (200 OK)
```json
{
  "brick": {
    "id": "uuid",
    "functionId": "uuid",
    "type": "string",
    "positionX": 0,
    "positionY": 0,
    "configuration": {},
    "createdAt": "iso8601-timestamp",
    "updatedAt": "iso8601-timestamp"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Position
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid position",
    "details": {
      "field": "positionX",
      "validationErrors": [
        {
          "field": "positionX",
          "message": "Position X must be between 0 and 10000"
        }
      ]
    }
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
    "message": "You don't have permission to modify this brick",
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
- **200 OK**: Brick updated successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to modify brick
- **404 Not Found**: Brick does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate brick ID is valid UUID
4. Validate position coordinates (if provided, 0-10000 range)
5. Validate configuration is valid JSON object (if provided)
6. Query brick from database by ID
7. If brick not found, return 404
8. Query function for brick
9. Query project for function
10. Check if user is project owner OR has permission
11. If user lacks access, return 403
12. Update brick fields (position and/or configuration)
13. Update updated_at timestamp
14. Return updated brick

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before update

## Request Example (Update Position)
```json
PUT /api/v1/bricks/cc0e8400-e29b-41d4-a716-446655440007
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "positionX": 200,
  "positionY": 200
}
```

## Request Example (Update Configuration)
```json
PUT /api/v1/bricks/cc0e8400-e29b-41d4-a716-446655440007
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "configuration": {
    "databaseName": "default database"
  }
}
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "brick": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "functionId": "770e8400-e29b-41d4-a716-446655440002",
    "type": "ListInstancesByDB",
    "positionX": 200,
    "positionY": 200,
    "configuration": {
      "databaseName": "default database"
    },
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:10:00.000Z"
  }
}
```

## Related Use Cases
- Set Brick Input Parameter (from 03-functional-requirements.md)
- Move brick on canvas (implied from Add Brick use case)

## Notes
- Position and configuration can be updated independently
- Configuration is merged with existing configuration (not replaced)
- Changes are automatically persisted (auto-save with 500ms debounce)
- Updated timestamp is automatically set
- Response time should be < 250ms (PUT request performance requirement)
- This endpoint is called when user moves brick or sets input parameter

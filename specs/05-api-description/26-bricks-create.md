# POST /api/v1/functions/:id/bricks

## Endpoint
`POST /api/v1/functions/:id/bricks`

## Description
Adds a new brick to a function's canvas. The user must own the project containing the function or have permission to modify it. This endpoint is called when a user drags a brick from the brick list to the canvas.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Path Parameters
- **id**: Function UUID
  - Type: UUID
  - Required: Yes
  - Example: "770e8400-e29b-41d4-a716-446655440002"

### Body
```json
{
  "type": "string (required)",
  "positionX": 0,
  "positionY": 0,
  "configuration": {}
}
```

### Field Validation
- **type**: 
  - Required: Yes
  - Type: String
  - Enum: ["ListInstancesByDB", "GetFirstInstance", "LogInstanceProps"]
  - Example: "ListInstancesByDB"

- **positionX**: 
  - Required: Yes
  - Type: Integer
  - Min: 0
  - Max: 10000
  - Example: 100

- **positionY**: 
  - Required: Yes
  - Type: Integer
  - Min: 0
  - Max: 10000
  - Example: 100

- **configuration**: 
  - Required: Yes
  - Type: Object (JSONB)
  - Default: {}
  - Example: {"databaseName": "default database"}

## Response Schema

### Success Response (201 Created)
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

#### 400 Bad Request - Invalid Brick Type
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid brick type",
    "details": {
      "field": "type",
      "validationErrors": [
        {
          "field": "type",
          "message": "Brick type must be one of: ListInstancesByDB, GetFirstInstance, LogInstanceProps"
        }
      ]
    }
  }
}
```

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
    "message": "You don't have permission to add bricks to this function",
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
- **201 Created**: Brick created successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to add bricks
- **404 Not Found**: Function does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate function ID is valid UUID
4. Validate brick type (enum validation)
5. Validate position coordinates (0-10000 range)
6. Validate configuration is valid JSON object
7. Query function from database by ID
8. If function not found, return 404
9. Query project for function
10. Check if user is project owner OR has permission
11. If user lacks access, return 403
12. Create brick record in database with:
    - Generated UUID
    - Function ID
    - Type
    - Position X and Y
    - Configuration (JSONB)
    - Created at timestamp
    - Updated at timestamp
13. Return created brick

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before creation

## Request Example
```json
POST /api/v1/functions/770e8400-e29b-41d4-a716-446655440002/bricks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "type": "ListInstancesByDB",
  "positionX": 100,
  "positionY": 100,
  "configuration": {}
}
```

## Response Example (Success)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "brick": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "functionId": "770e8400-e29b-41d4-a716-446655440002",
    "type": "ListInstancesByDB",
    "positionX": 100,
    "positionY": 100,
    "configuration": {},
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

## Related Use Cases
- Add Brick to Function Editor (from 03-functional-requirements.md)

## Notes
- Brick is immediately available after creation
- Position coordinates are grid-based
- Configuration is stored as JSONB for flexibility
- Changes are automatically persisted (auto-save)
- Response time should be < 300ms (POST request performance requirement)
- This endpoint is called when user drags brick to canvas

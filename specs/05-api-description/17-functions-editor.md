# GET /api/v1/functions/:id/editor

## Endpoint
`GET /api/v1/functions/:id/editor`

## Description
Retrieves all data required to open the Function Editor, including function details, bricks with positions and configurations, and connections between bricks. This endpoint provides a complete snapshot of the function for the visual editor interface.

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

## Response Schema

### Success Response (200 OK)
```json
{
  "function": {
    "id": "uuid",
    "name": "string",
    "projectId": "uuid",
    "createdAt": "iso8601-timestamp",
    "updatedAt": "iso8601-timestamp"
  },
  "bricks": [
    {
      "id": "uuid",
      "functionId": "uuid",
      "type": "string",
      "positionX": 0,
      "positionY": 0,
      "configuration": {},
      "createdAt": "iso8601-timestamp",
      "updatedAt": "iso8601-timestamp"
    }
  ],
  "connections": [
    {
      "id": "uuid",
      "fromBrickId": "uuid",
      "fromOutputName": "string",
      "toBrickId": "uuid",
      "toInputName": "string",
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
    "message": "You don't have permission to access this function",
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
- **200 OK**: Editor data retrieved successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to access function
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
9. Query all bricks for function
10. Query all connections for bricks in function
11. Return complete editor data

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/functions/770e8400-e29b-41d4-a716-446655440002/editor
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "function": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "My Function",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "bricks": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440007",
      "functionId": "770e8400-e29b-41d4-a716-446655440002",
      "type": "ListInstancesByDB",
      "positionX": 100,
      "positionY": 100,
      "configuration": {
        "databaseName": "default database"
      },
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440008",
      "functionId": "770e8400-e29b-41d4-a716-446655440002",
      "type": "GetFirstInstance",
      "positionX": 300,
      "positionY": 100,
      "configuration": {},
      "createdAt": "2024-01-15T12:05:00.000Z",
      "updatedAt": "2024-01-15T12:05:00.000Z"
    }
  ],
  "connections": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440009",
      "fromBrickId": "cc0e8400-e29b-41d4-a716-446655440007",
      "fromOutputName": "List",
      "toBrickId": "dd0e8400-e29b-41d4-a716-446655440008",
      "toInputName": "List",
      "createdAt": "2024-01-15T12:10:00.000Z"
    }
  ]
}
```

## Related Use Cases
- Open Function Editor (from 03-functional-requirements.md)

## Notes
- This endpoint provides all data needed to render the Function Editor
- Bricks include positions (grid coordinates) and configurations
- Connections include source and target brick IDs and port names
- Empty arrays returned for bricks or connections if none exist
- Response time should be < 200ms (GET request performance requirement)
- This is a composite endpoint that aggregates multiple data sources
- Brick types: "ListInstancesByDB", "GetFirstInstance", "LogInstanceProps"

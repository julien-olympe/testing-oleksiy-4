# GET /api/v1/projects/:id/databases/:databaseId/instances

## Endpoint
`GET /api/v1/projects/:id/databases/:databaseId/instances`

## Description
Retrieves a list of all database instances for a specific database type in a project. The user must own the project or have permission to access it.

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

## Response Schema

### Success Response (200 OK)
```json
{
  "instances": [
    {
      "id": "uuid",
      "databaseId": "uuid",
      "values": [
        {
          "propertyId": "uuid",
          "propertyName": "string",
          "value": "string"
        }
      ],
      "createdAt": "iso8601-timestamp",
      "updatedAt": "iso8601-timestamp"
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
    "message": "You don't have permission to access this project",
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

#### 404 Not Found - Database Not Found
```json
{
  "error": {
    "code": "DATABASE_NOT_FOUND",
    "message": "Database not found",
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
- **200 OK**: Instances retrieved successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to access project
- **404 Not Found**: Project or database does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Validate database ID is valid UUID
5. Query project from database by ID
6. If project not found, return 404
7. Check if user is owner OR has permission
8. If user lacks access, return 403
9. Query database from database by ID
10. If database not found, return 404
11. Query all instances for database
12. For each instance, query property values
13. Return instances list with values

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/databases/990e8400-e29b-41d4-a716-446655440004/instances
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "instances": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "databaseId": "990e8400-e29b-41d4-a716-446655440004",
      "values": [
        {
          "propertyId": "aa0e8400-e29b-41d4-a716-446655440005",
          "propertyName": "string",
          "value": "First Instance Value"
        }
      ],
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440007",
      "databaseId": "990e8400-e29b-41d4-a716-446655440004",
      "values": [
        {
          "propertyId": "aa0e8400-e29b-41d4-a716-446655440005",
          "propertyName": "string",
          "value": "Second Instance Value"
        }
      ],
      "createdAt": "2024-01-15T12:05:00.000Z",
      "updatedAt": "2024-01-15T12:05:00.000Z"
    }
  ]
}
```

## Related Use Cases
- View database instances in Database tab (from 04-screens.md)

## Notes
- Instances are ordered by creation date (oldest first)
- Property values are included for each instance
- Empty array returned if database has no instances
- Response time should be < 200ms (GET request performance requirement)
- This endpoint is used to display instances in the Database tab

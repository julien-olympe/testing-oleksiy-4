# POST /api/v1/projects/:id/databases/:databaseId/instances

## Endpoint
`POST /api/v1/projects/:id/databases/:databaseId/instances`

## Description
Creates a new database instance for a specific database type in a project. The user must own the project or have permission to modify it. This endpoint is called when a user clicks the "Create instance" button.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Path Parameters
- **id**: Project UUID
  - Type: UUID
  - Required: Yes
  - Example: "550e8400-e29b-41d4-a716-446655440000"

- **databaseId**: Database UUID
  - Type: UUID
  - Required: Yes
  - Example: "990e8400-e29b-41d4-a716-446655440004"

### Body
Empty body (no request body required)

## Response Schema

### Success Response (201 Created)
```json
{
  "instance": {
    "id": "uuid",
    "databaseId": "uuid",
    "values": [
      {
        "propertyId": "uuid",
        "propertyName": "string",
        "value": ""
      }
    ],
    "createdAt": "iso8601-timestamp",
    "updatedAt": "iso8601-timestamp"
    }
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
    "message": "You don't have permission to create instances in this project",
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
- **201 Created**: Instance created successfully
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to create instances
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
11. Query all properties for database
12. Begin database transaction
13. Create instance record in database
14. For each property, create instance value record with empty value
15. Commit transaction
16. If any error occurs, rollback transaction
17. Return created instance with empty values

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before creation

## Request Example
```json
POST /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/databases/990e8400-e29b-41d4-a716-446655440004/instances
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Response Example (Success)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "instance": {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "databaseId": "990e8400-e29b-41d4-a716-446655440004",
    "values": [
      {
        "propertyId": "aa0e8400-e29b-41d4-a716-446655440005",
        "propertyName": "string",
        "value": ""
      }
    ],
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

## Related Use Cases
- Create Database Instance (from 03-functional-requirements.md)

## Notes
- Instance is created with empty values for all properties
- Values are initialized as empty strings (can be updated via update endpoint)
- Transaction ensures all property values are created atomically
- Instance is immediately available after creation
- Response time should be < 300ms (POST request performance requirement)
- This endpoint is called when user clicks "Create instance" button

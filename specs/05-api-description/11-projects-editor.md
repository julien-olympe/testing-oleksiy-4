# GET /api/v1/projects/:id/editor

## Endpoint
`GET /api/v1/projects/:id/editor`

## Description
Retrieves all data required to open the Project Editor, including project details, functions list, permissions list, and database types with instances. This endpoint provides a complete snapshot of the project for the editor interface.

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

## Response Schema

### Success Response (200 OK)
```json
{
  "project": {
    "id": "uuid",
    "name": "string",
    "ownerId": "uuid",
    "createdAt": "iso8601-timestamp",
    "updatedAt": "iso8601-timestamp"
  },
  "functions": [
    {
      "id": "uuid",
      "name": "string",
      "projectId": "uuid",
      "createdAt": "iso8601-timestamp",
      "updatedAt": "iso8601-timestamp"
    }
  ],
  "permissions": [
    {
      "userId": "uuid",
      "userEmail": "string",
      "createdAt": "iso8601-timestamp"
    }
  ],
  "databases": [
    {
      "id": "uuid",
      "name": "string",
      "projectId": "uuid",
      "properties": [
        {
          "id": "uuid",
          "name": "string",
          "type": "string"
        }
      ],
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
- **403 Forbidden**: User lacks permission to access project
- **404 Not Found**: Project does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Query project from database by ID
5. If project not found, return 404
6. Check if user is owner OR has permission
7. If user lacks access, return 403
8. Query all functions for project
9. Query all permissions for project (with user emails)
10. Query all databases for project (including default database)
11. For each database, query properties and instances
12. For each instance, query property values
13. Return complete editor data

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/editor
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Project",
    "ownerId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-15T10:30:45.123Z",
    "updatedAt": "2024-01-15T10:30:45.123Z"
  },
  "functions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "My Function",
      "projectId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "permissions": [
    {
      "userId": "880e8400-e29b-41d4-a716-446655440003",
      "userEmail": "shared@example.com",
      "createdAt": "2024-01-15T11:30:00.000Z"
    }
  ],
  "databases": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "name": "default database",
      "projectId": "system-project-id",
      "properties": [
        {
          "id": "aa0e8400-e29b-41d4-a716-446655440005",
          "name": "string",
          "type": "string"
        }
      ],
      "instances": [
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440006",
          "databaseId": "990e8400-e29b-41d4-a716-446655440004",
          "values": [
            {
              "propertyId": "aa0e8400-e29b-41d4-a716-446655440005",
              "propertyName": "string",
              "value": "Instance Value"
            }
          ],
          "createdAt": "2024-01-15T12:00:00.000Z",
          "updatedAt": "2024-01-15T12:00:00.000Z"
        }
      ]
    }
  ]
}
```

## Related Use Cases
- Open Project Editor (from 03-functional-requirements.md)

## Notes
- This endpoint provides all data needed to render the Project Editor
- Default database is included in the databases list
- Functions list includes all functions in the project
- Permissions list includes user emails for display
- Database instances include all property values
- Response time should be < 200ms (GET request performance requirement)
- This is a composite endpoint that aggregates multiple data sources
- Empty arrays returned for functions, permissions, or instances if none exist

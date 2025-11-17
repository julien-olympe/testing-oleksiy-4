# GET /api/v1/projects/:id/databases

## Endpoint
`GET /api/v1/projects/:id/databases`

## Description
Retrieves a list of all database types available for a project. This includes the "default database" and any project-specific databases. The user must own the project or have permission to access it.

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
- **200 OK**: Databases retrieved successfully
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
8. Query all databases for project (including default database)
9. For each database, query properties
10. Return databases list with properties

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/databases
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
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
      ]
    }
  ]
}
```

## Related Use Cases
- View Databases (from 03-functional-requirements.md)

## Notes
- Default database is always included in the list
- Database properties are included for each database
- Empty array returned if no databases exist (unlikely, as default database always exists)
- Response time should be < 200ms (GET request performance requirement)
- This endpoint is used to display databases in the Database tab

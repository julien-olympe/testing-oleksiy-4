# GET /api/v1/projects

## Endpoint
`GET /api/v1/projects`

## Description
Retrieves a paginated list of projects that the authenticated user owns or has permissions to access. Projects are returned in reverse chronological order (newest first).

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)

### Query Parameters
- **limit** (optional): Number of projects per page
  - Type: Integer
  - Default: 50
  - Min: 1
  - Max: 50
  - Example: 50

- **offset** (optional): Number of projects to skip
  - Type: Integer
  - Default: 0
  - Min: 0
  - Example: 0

## Response Schema

### Success Response (200 OK)
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "ownerId": "uuid",
      "createdAt": "iso8601-timestamp",
      "updatedAt": "iso8601-timestamp"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100,
    "hasMore": true
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

#### 400 Bad Request - Invalid Query Parameters
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "details": {
      "validationErrors": [
        {
          "field": "limit",
          "message": "Limit must be between 1 and 50"
        }
      ]
    }
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
- **200 OK**: Projects retrieved successfully
- **400 Bad Request**: Invalid query parameters
- **401 Unauthorized**: Invalid or missing token
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Query projects where user is owner OR user has permission
4. Apply pagination (limit, offset)
5. Order by created_at DESC (newest first)
6. Count total projects for pagination metadata
7. Return projects list with pagination info

## Authorization Rules
- User must be authenticated
- Returns only projects user owns or has permissions for
- Uses row-level security to filter projects

## Request Example
```json
GET /api/v1/projects?limit=50&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Project",
      "ownerId": "660e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2024-01-15T10:30:45.123Z",
      "updatedAt": "2024-01-15T10:30:45.123Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Another Project",
      "ownerId": "660e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2024-01-14T08:20:30.456Z",
      "updatedAt": "2024-01-14T08:20:30.456Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 2,
    "hasMore": false
  }
}
```

## Response Example (Error - Invalid Query Parameters)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "details": {
      "validationErrors": [
        {
          "field": "limit",
          "message": "Limit must be between 1 and 50"
        }
      ]
    }
  }
}
```

## Related Use Cases
- View projects on Home Screen (from 04-screens.md)

## Notes
- Pagination is required for lists with more than 50 items (performance requirement)
- Default limit is 50 (maximum allowed)
- Projects are filtered by ownership and permissions at database level
- Response time should be < 200ms (GET request performance requirement)
- Empty list returns empty array with pagination metadata

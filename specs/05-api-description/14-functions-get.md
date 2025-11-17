# GET /api/v1/functions/:id

## Endpoint
`GET /api/v1/functions/:id`

## Description
Retrieves a single function by ID. The user must own the project containing the function or have permission to access it.

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
- **200 OK**: Function retrieved successfully
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
7. Check if user is project owner OR has project permission
8. If user lacks access, return 403
9. Return function data

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before data access

## Request Example
```json
GET /api/v1/functions/770e8400-e29b-41d4-a716-446655440002
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
  }
}
```

## Response Example (Error - Not Found)
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "FUNCTION_NOT_FOUND",
    "message": "Function not found",
    "details": {}
  }
}
```

## Related Use Cases
- Function retrieval (used before opening Function Editor)

## Notes
- Permission check is performed via project ownership/permission
- 404 is returned if function doesn't exist OR user lacks access
- Response time should be < 200ms (GET request performance requirement)
- This endpoint is used to verify function access before opening editor

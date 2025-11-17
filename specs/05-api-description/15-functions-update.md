# PUT /api/v1/functions/:id

## Endpoint
`PUT /api/v1/functions/:id`

## Description
Updates a function's name. The user must own the project containing the function or have permission to modify it. This endpoint is called when a user renames a function.

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
  "name": "string (required)"
}
```

### Field Validation
- **name**: 
  - Required: Yes
  - Type: String
  - Min length: 1 character
  - Max length: 255 characters
  - Example: "Renamed Function"

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

#### 400 Bad Request - Invalid Function Name
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid function name",
    "details": {
      "field": "name",
      "validationErrors": [
        {
          "field": "name",
          "message": "Function name must be between 1 and 255 characters"
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
    "message": "You don't have permission to modify this function",
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
- **200 OK**: Function updated successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to modify function
- **404 Not Found**: Function does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate function ID is valid UUID
4. Validate function name (required, 1-255 characters)
5. Query function from database by ID
6. If function not found, return 404
7. Query project for function
8. Check if user is project owner OR has permission
9. If user lacks access, return 403
10. Update function name in database
11. Update updated_at timestamp
12. Return updated function

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before update

## Request Example
```json
PUT /api/v1/functions/770e8400-e29b-41d4-a716-446655440002
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Renamed Function"
}
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "function": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Renamed Function",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

## Related Use Cases
- Rename Function (from 03-functional-requirements.md)

## Notes
- Only function name can be updated via this endpoint
- Updated timestamp is automatically set
- Changes are persisted immediately (auto-save)
- Response time should be < 250ms (PUT request performance requirement)
- Function name validation ensures non-empty and reasonable length

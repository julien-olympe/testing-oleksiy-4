# POST /api/v1/projects/:id/functions

## Endpoint
`POST /api/v1/projects/:id/functions`

## Description
Creates a new function in a project with a default name. The user must own the project or have permission to modify it. This endpoint is called when a user drags the "Function" brick to the function list area.

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

### Body
```json
{
  "name": "string (optional)"
}
```

### Field Validation
- **name**: 
  - Required: No (defaults to "New Function" if not provided)
  - Type: String
  - Min length: 1 character
  - Max length: 255 characters
  - Example: "My New Function"

## Response Schema

### Success Response (201 Created)
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
    "message": "You don't have permission to create functions in this project",
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
- **201 Created**: Function created successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to create functions
- **404 Not Found**: Project does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Validate function name (if provided)
5. Set default name "New Function" if name not provided
6. Query project from database by ID
7. If project not found, return 404
8. Check if user is owner OR has permission
9. If user lacks access, return 403
10. Create function record in database with:
    - Generated UUID
    - Name (provided or default)
    - Project ID
    - Created at timestamp
    - Updated at timestamp
11. Return created function

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before creation

## Request Example
```json
POST /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/functions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "My New Function"
}
```

## Response Example (Success)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "function": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "My New Function",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## Response Example (Success with Default Name)
```json
POST /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/functions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "function": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "New Function",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## Related Use Cases
- Create Function (from 03-functional-requirements.md)

## Notes
- Default name "New Function" is used when name is not provided
- Function is immediately available after creation
- Empty function definition is created (no bricks initially)
- Response time should be < 300ms (POST request performance requirement)
- Function creation is idempotent in terms of user action (drag-and-drop creates one function)

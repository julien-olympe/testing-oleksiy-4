# POST /api/v1/projects/:id/permissions

## Endpoint
`POST /api/v1/projects/:id/permissions`

## Description
Adds a permission for a user to access a project by email. The user must own the project or have permission to modify it. Only registered users can be granted permissions.

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
  "email": "string (required)"
}
```

### Field Validation
- **email**: 
  - Required: Yes
  - Type: String
  - Format: Valid email address
  - Example: "user@example.com"

## Response Schema

### Success Response (201 Created)
```json
{
  "permission": {
    "userId": "uuid",
    "userEmail": "string",
    "projectId": "uuid",
    "createdAt": "iso8601-timestamp"
  }
}
```

### Error Responses

#### 400 Bad Request - User Not Found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {
      "email": "user@example.com"
    }
  }
}
```

#### 400 Bad Request - User Already Has Permission
```json
{
  "error": {
    "code": "USER_ALREADY_HAS_PERMISSION",
    "message": "User already has permission",
    "details": {
      "email": "user@example.com"
    }
  }
}
```

#### 400 Bad Request - Invalid Email Format
```json
{
  "error": {
    "code": "INVALID_EMAIL_FORMAT",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "validationErrors": [
        {
          "field": "email",
          "message": "Invalid email format"
        }
      ]
    }
  }
}
```

#### 400 Bad Request - Required Field Missing
```json
{
  "error": {
    "code": "REQUIRED_FIELD_MISSING",
    "message": "Required field is missing",
    "details": {
      "field": "email",
      "validationErrors": [
        {
          "field": "email",
          "message": "Email is required"
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
    "message": "You don't have permission to add permissions for this project",
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
- **201 Created**: Permission added successfully
- **400 Bad Request**: Validation error, user not found, or user already has permission
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to add permissions
- **404 Not Found**: Project does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Validate email format
5. Query project from database by ID
6. If project not found, return 404
7. Check if user is owner OR has permission
8. If user lacks access, return 403
9. Query user by email
10. If user not found, return 400 User Not Found
11. Check if permission already exists (project_id, user_id)
12. If permission exists, return 400 User Already Has Permission
13. Create permission record in database
14. Return created permission with user email

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before creation

## Request Example
```json
POST /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/permissions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "shared@example.com"
}
```

## Response Example (Success)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "permission": {
    "userId": "880e8400-e29b-41d4-a716-446655440003",
    "userEmail": "shared@example.com",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T11:30:00.000Z"
  }
}
```

## Response Example (Error - User Not Found)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {
      "email": "nonexistent@example.com"
    }
  }
}
```

## Response Example (Error - User Already Has Permission)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "USER_ALREADY_HAS_PERMISSION",
    "message": "User already has permission",
    "details": {
      "email": "shared@example.com"
    }
  }
}
```

## Related Use Cases
- Add Project Permission (from 03-functional-requirements.md)

## Notes
- Only registered users can be granted permissions
- Duplicate permissions are prevented by composite primary key
- User email is used to find the user account
- Permission is immediately available after creation
- Response time should be < 300ms (POST request performance requirement)
- Owner is not included in permissions list (implicit ownership)

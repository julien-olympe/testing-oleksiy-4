# GET /api/v1/users/me

## Endpoint
`GET /api/v1/users/me`

## Description
Retrieves the authenticated user's profile information, including user ID, email, and account creation date.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)

### Query Parameters
None

## Response Schema

### Success Response (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "createdAt": "iso8601-timestamp"
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

#### 401 Unauthorized - Authentication Required
```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication required",
    "details": {}
  }
}
```

#### 404 Not Found - User Not Found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
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
- **200 OK**: User profile retrieved successfully
- **401 Unauthorized**: Invalid or missing token
- **404 Not Found**: User does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Query user from database by ID
4. If user not found, return 404
5. Return user profile (exclude sensitive data like password hash)

## Authorization Rules
- User must be authenticated
- Users can only retrieve their own profile
- User ID from token must match requested user

## Request Example
```json
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:45.123Z"
  }
}
```

## Response Example (Error - Invalid Token)
```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

## Related Use Cases
- User profile retrieval (used in settings menu display)

## Notes
- Password hash and other sensitive data are never returned
- User ID and email are extracted from JWT token for security
- This endpoint is used to display user information in the settings menu
- Response time should be < 200ms (GET request performance requirement)

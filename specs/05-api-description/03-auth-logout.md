# POST /api/v1/auth/logout

## Endpoint
`POST /api/v1/auth/logout`

## Description
Logs out the authenticated user by invalidating the access token and refresh token. The access token is added to a blacklist, and the refresh token cookie is cleared.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "message": "Logged out successfully"
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
- **200 OK**: User logged out successfully
- **401 Unauthorized**: Invalid or missing token
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Add access token to blacklist (prevents reuse)
4. Clear refresh token cookie (set to empty with Max-Age=0)
5. Log logout event
6. Return success response

## Authorization Rules
- User must be authenticated
- Any authenticated user can log themselves out
- Token must be valid and not expired

## Request Example
```json
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0

{
  "message": "Logged out successfully"
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
- Logout (from 03-functional-requirements.md)

## Notes
- Blacklisted tokens are checked on all protected endpoints
- Refresh token cookie is cleared by setting empty value with Max-Age=0
- Token blacklist should be cleaned up periodically (remove expired tokens)
- Logout is idempotent (multiple logout calls are safe)
- After logout, user must re-authenticate to access protected endpoints

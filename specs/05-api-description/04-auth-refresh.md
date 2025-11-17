# POST /api/v1/auth/refresh

## Endpoint
`POST /api/v1/auth/refresh`

## Description
Refreshes the access token using a valid refresh token stored in an httpOnly cookie. Returns a new access token with extended expiration. Optionally issues a new refresh token if the current one is close to expiration.

## Authentication
Required (refresh token in httpOnly cookie)

## Request Schema

### Headers
- `Content-Type: application/json`

### Cookies
- `refreshToken`: JWT refresh token (httpOnly cookie)

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "token": "jwt-access-token",
  "expiresIn": 86400
}
```

### Error Responses

#### 401 Unauthorized - Invalid Refresh Token
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired refresh token",
    "details": {}
  }
}
```

#### 401 Unauthorized - Refresh Token Missing
```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Refresh token required",
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
- **200 OK**: Token refreshed successfully
- **401 Unauthorized**: Invalid or missing refresh token
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Extract refresh token from httpOnly cookie
2. If refresh token missing, return 401
3. Validate refresh token (signature, expiration)
4. If refresh token invalid or expired, return 401
5. Extract user ID from refresh token
6. Verify user exists in database
7. Generate new JWT access token (24-hour expiration)
8. If refresh token expires within 24 hours, generate new refresh token (7-day expiration) and set in cookie
9. Return new access token

## Authorization Rules
- Refresh token must be valid and not expired
- User must exist in system
- No access token required (uses refresh token from cookie)

## Request Example
```json
POST /api/v1/auth/refresh
Content-Type: application/json
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJleHAiOjE3MDUzMzQyNDV9.signature",
  "expiresIn": 86400
}
```

## Response Example (Success with New Refresh Token)
```json
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJleHAiOjE3MDUzMzQyNDV9.signature",
  "expiresIn": 86400
}
```

## Response Example (Error - Invalid Refresh Token)
```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired refresh token",
    "details": {}
  }
}
```

## Related Use Cases
- Token refresh mechanism (from 00-introduction.md)

## Notes
- Refresh token is automatically sent by browser in httpOnly cookie
- New access token should replace old one in client storage
- If refresh token is close to expiration (< 24 hours), a new refresh token is issued
- Old refresh token remains valid until expiration (no immediate invalidation)
- Client should call this endpoint before access token expires to maintain session
- Failed refresh attempts should be logged for security monitoring

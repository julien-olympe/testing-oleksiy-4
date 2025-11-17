# POST /api/v1/auth/login

## Endpoint
`POST /api/v1/auth/login`

## Description
Authenticates an existing user with email and password. Upon successful authentication, returns an access token and sets a refresh token in an httpOnly cookie.

## Authentication
Not required (public endpoint)

## Request Schema

### Headers
- `Content-Type: application/json`

### Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Field Validation
- **email**: 
  - Required: Yes
  - Type: String
  - Format: Valid email address
  - Example: "user@example.com"

- **password**: 
  - Required: Yes
  - Type: String
  - Example: "SecurePass123!"

## Response Schema

### Success Response (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "createdAt": "iso8601-timestamp"
  },
  "token": "jwt-access-token",
  "expiresIn": 86400
}
```

### Error Responses

#### 401 Unauthorized - Invalid Credentials
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {}
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
- **200 OK**: User authenticated successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid credentials
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate email and password are provided
2. Find user by email in database
3. If user not found, return 401 Invalid Credentials
4. Compare provided password with stored password hash using bcrypt
5. If password mismatch, return 401 Invalid Credentials
6. Generate JWT access token (24-hour expiration)
7. Generate refresh token (7-day expiration)
8. Set refresh token in httpOnly cookie
9. Return user data and access token

## Authorization Rules
- No authorization required (public endpoint)
- Any registered user can authenticate

## Request Example
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:45.123Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJleHAiOjE3MDUzMzQyNDV9.signature",
  "expiresIn": 86400
}
```

## Response Example (Error - Invalid Credentials)
```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {}
  }
}
```

## Related Use Cases
- Login (from 03-functional-requirements.md)

## Notes
- Access token should be stored client-side and included in Authorization header for subsequent requests
- Refresh token is automatically set in httpOnly cookie
- Generic error message "Invalid email or password" prevents user enumeration attacks
- Password comparison uses constant-time bcrypt comparison to prevent timing attacks
- Failed login attempts should be logged for security monitoring

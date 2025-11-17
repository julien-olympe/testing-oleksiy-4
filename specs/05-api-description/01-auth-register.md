# POST /api/v1/auth/register

## Endpoint
`POST /api/v1/auth/register`

## Description
Creates a new user account and automatically authenticates the user. Upon successful registration, the user receives an access token and refresh token, and is automatically logged in.

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
  - Format: Valid email address (RFC 5322)
  - Unique: Must not exist in system
  - Min length: 5 characters
  - Max length: 255 characters
  - Example: "user@example.com"

- **password**: 
  - Required: Yes
  - Type: String
  - Min length: 8 characters
  - Max length: 128 characters
  - Complexity: At least one uppercase letter, one lowercase letter, one number
  - Example: "SecurePass123!"

## Response Schema

### Success Response (201 Created)
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

#### 400 Bad Request - Email Already Registered
```json
{
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "Email already registered",
    "details": {}
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

#### 400 Bad Request - Password Does Not Meet Requirements
```json
{
  "error": {
    "code": "INVALID_PASSWORD_FORMAT",
    "message": "Password does not meet requirements",
    "details": {
      "field": "password",
      "validationErrors": [
        {
          "field": "password",
          "message": "Password must be at least 8 characters and contain uppercase, lowercase, and number"
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
- **201 Created**: User registered successfully
- **400 Bad Request**: Validation error or email already registered
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate email format and uniqueness
2. Validate password requirements
3. Hash password using bcrypt (cost factor 12)
4. Create user record in database
5. Generate JWT access token (24-hour expiration)
6. Generate refresh token (7-day expiration)
7. Set refresh token in httpOnly cookie
8. Return user data and access token

## Authorization Rules
- No authorization required (public endpoint)
- New users can register without authentication

## Request Example
```json
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!"
}
```

## Response Example (Success)
```json
HTTP/1.1 201 Created
Content-Type: application/json
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "createdAt": "2024-01-15T10:30:45.123Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6Im5ld3VzZXJAZXhhbXBsZS5jb20iLCJleHAiOjE3MDUzMzQyNDV9.signature",
  "expiresIn": 86400
}
```

## Response Example (Error - Email Already Registered)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "Email already registered",
    "details": {}
  }
}
```

## Related Use Cases
- Register (from 03-functional-requirements.md)

## Notes
- User is automatically logged in after successful registration
- Access token should be stored client-side and included in Authorization header for subsequent requests
- Refresh token is automatically set in httpOnly cookie and used for token refresh
- Password is never returned in response
- All passwords are hashed using bcrypt before storage

# API Introduction

## Authentication Mechanism

### JWT Token Authentication

The application uses JSON Web Tokens (JWT) for stateless authentication. All protected API endpoints require a valid JWT token in the Authorization header.

#### Access Tokens
- **Format**: JWT (JSON Web Token)
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: 256-bit secret key (stored securely in environment variables)
- **Expiration**: 24 hours from issuance
- **Header Format**: `Authorization: Bearer <token>`
- **Payload**: Contains user ID, email, and expiration timestamp

#### Refresh Tokens
- **Storage**: httpOnly cookies (prevents XSS attacks)
- **Expiration**: 7 days from issuance
- **Purpose**: Obtain new access tokens without re-authentication
- **Cookie Name**: `refreshToken`
- **HttpOnly**: true (not accessible via JavaScript)
- **Secure**: true (HTTPS only in production)
- **SameSite**: Strict (CSRF protection)

#### Token Revocation
- **Mechanism**: Blacklist mechanism for logged-out tokens
- **Storage**: In-memory cache or Redis (for distributed systems)
- **Scope**: Access tokens are blacklisted on logout
- **Validation**: All protected endpoints check token blacklist before processing
- **Cleanup**: Blacklisted tokens removed after expiration

#### Token Refresh Flow
1. Client sends refresh token via httpOnly cookie
2. Server validates refresh token
3. Server issues new access token (24-hour expiration)
4. Server issues new refresh token (7-day expiration) if refresh token expires within 24 hours
5. Server returns new access token in response body
6. Client updates Authorization header with new token

#### Authentication Endpoints
- `POST /api/v1/auth/register`: Create new user account (no token required)
- `POST /api/v1/auth/login`: Authenticate user, receive access token and refresh token cookie
- `POST /api/v1/auth/logout`: Invalidate access token and refresh token
- `POST /api/v1/auth/refresh`: Obtain new access token using refresh token

#### Protected Endpoints
All endpoints except authentication endpoints require valid JWT token:
- Token must be present in Authorization header
- Token must be valid (not expired, not blacklisted)
- Token must contain valid user ID
- User must exist in system

#### Error Responses
- **401 Unauthorized**: Missing token, invalid token, expired token, or blacklisted token
- Error message: "Invalid or expired token" or "Authentication required"

## Logging Patterns

### Structured JSON Logging

All API endpoints implement structured JSON logging with consistent context information.

#### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "requestId": "req-1234567890",
  "userId": "user-uuid",
  "endpoint": "POST /api/v1/projects",
  "method": "POST",
  "statusCode": 201,
  "duration": 145,
  "message": "Project created successfully",
  "context": {
    "projectId": "project-uuid",
    "projectName": "My Project"
  },
  "stackTrace": null
}
```

#### Severity Levels
- **DEBUG**: Detailed diagnostic information for development
- **INFO**: General informational messages about normal operations
- **WARN**: Warning messages for potentially harmful situations
- **ERROR**: Error messages for error events that might still allow the application to continue
- **CRITICAL**: Critical error messages for serious failures that may cause application termination

#### Context Fields
All log entries include:
- **timestamp**: ISO 8601 format UTC timestamp
- **level**: Severity level (DEBUG, INFO, WARN, ERROR, CRITICAL)
- **requestId**: Unique identifier for the request (from X-Request-ID header or auto-generated)
- **userId**: Authenticated user ID (null for unauthenticated requests)
- **endpoint**: API endpoint path
- **method**: HTTP method
- **statusCode**: HTTP response status code
- **duration**: Request processing time in milliseconds
- **message**: Human-readable log message
- **context**: Additional context-specific data (varies by endpoint)
- **stackTrace**: Stack trace for errors (null for non-error logs)

#### Logging Requirements
- All API requests logged at INFO level with request details
- All errors logged at ERROR or CRITICAL level with stack traces
- Sensitive data excluded from logs (passwords, tokens, PII)
- Request/response bodies logged at DEBUG level only
- Performance metrics logged for all requests (duration)

#### Log Storage
- Logs written to stdout/stderr (containerized environments)
- Structured format enables log aggregation and analysis
- Log rotation configured to prevent disk space issues
- Log retention: 30 days for INFO/WARN, 90 days for ERROR/CRITICAL

## Error Handling Patterns

### Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details",
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

#### Error Code Structure
- **Format**: UPPER_SNAKE_CASE
- **Examples**: 
  - `EMAIL_ALREADY_REGISTERED`
  - `INVALID_CREDENTIALS`
  - `PERMISSION_DENIED`
  - `RESOURCE_NOT_FOUND`
  - `VALIDATION_ERROR`
  - `INTERNAL_SERVER_ERROR`

#### Error Categories

**Authentication Errors (401)**
- `AUTHENTICATION_REQUIRED`: No token provided
- `INVALID_TOKEN`: Token format invalid
- `EXPIRED_TOKEN`: Token has expired
- `TOKEN_BLACKLISTED`: Token has been revoked

**Authorization Errors (403)**
- `PERMISSION_DENIED`: User lacks required permissions
- `RESOURCE_OWNERSHIP_REQUIRED`: User must own resource
- `PROJECT_ACCESS_DENIED`: User cannot access project

**Validation Errors (400)**
- `VALIDATION_ERROR`: General validation failure
- `REQUIRED_FIELD_MISSING`: Required field is empty
- `INVALID_EMAIL_FORMAT`: Email format invalid
- `INVALID_PASSWORD_FORMAT`: Password does not meet requirements
- `INVALID_UUID_FORMAT`: UUID format invalid

**Not Found Errors (404)**
- `RESOURCE_NOT_FOUND`: Resource does not exist
- `USER_NOT_FOUND`: User does not exist
- `PROJECT_NOT_FOUND`: Project does not exist
- `FUNCTION_NOT_FOUND`: Function does not exist

**Business Logic Errors (400)**
- `EMAIL_ALREADY_REGISTERED`: Email already in use
- `USER_ALREADY_HAS_PERMISSION`: Permission already granted
- `INVALID_BRICK_CONNECTION`: Brick connection invalid
- `MISSING_REQUIRED_INPUTS`: Required brick inputs not configured
- `EXECUTION_FAILED`: Function execution failed

**Server Errors (500)**
- `INTERNAL_SERVER_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `TRANSACTION_FAILED`: Database transaction failed

### Try-Catch Blocks

All API endpoints implement comprehensive error handling:

```typescript
try {
  // Validate authentication
  // Validate authorization
  // Validate input
  // Execute business logic
  // Return success response
} catch (ValidationError e) {
  // Log at WARN level
  // Return 400 with validation details
} catch (AuthenticationError e) {
  // Log at WARN level
  // Return 401 with authentication error
} catch (AuthorizationError e) {
  // Log at WARN level
  // Return 403 with authorization error
} catch (NotFoundError e) {
  // Log at INFO level
  // Return 404 with not found error
} catch (BusinessLogicError e) {
  // Log at WARN level
  // Return 400 with business logic error
} catch (Error e) {
  // Log at ERROR level with stack trace
  // Return 500 with internal server error
}
```

### Transaction Management

All multi-step database operations use transactions with rollback on failure:

```typescript
await db.transaction(async (tx) => {
  try {
    // Step 1: Create resource
    // Step 2: Create related resources
    // Step 3: Update relationships
    // Commit transaction
  } catch (error) {
    // Transaction automatically rolls back
    // Log error with context
    // Throw error for error handling
  }
});
```

#### Transaction Rules
- All write operations wrapped in transactions
- Rollback on any error or exception
- Transaction timeout: 30 seconds maximum
- Deadlock detection with automatic retry (exponential backoff)
- Single operations: Auto-commit enabled
- Multi-step operations: Explicit transaction boundaries

### Graceful Degradation

The system implements graceful degradation for non-critical features:

- **Core Features**: Always available (login, project access)
- **Non-Critical Features**: Degrade silently if unavailable
- **Visual Editor**: Works without real-time connections
- **Performance**: Response time increases logged but service continues
- **Rate Limiting**: Prevents resource exhaustion
- **Queue System**: High-load operations queued for processing
- **Automatic Scaling**: Triggers on performance degradation

#### Degradation Strategies
- **Retry Logic**: Automatic retry for transient failures (network, database)
- **Circuit Breaker**: Prevents cascading failures for external services
- **Fallback Values**: Default values when data unavailable
- **Partial Responses**: Return available data when some data unavailable
- **Error Recovery**: Automatic recovery from non-fatal errors

### Error Logging

All errors logged with full context:

- **Error Level**: ERROR or CRITICAL based on severity
- **Context**: User ID, request ID, endpoint, method
- **Stack Trace**: Full stack trace for debugging
- **Request Data**: Request body and parameters (sanitized)
- **Response Data**: Response status and error details
- **Duration**: Request processing time
- **User Impact**: Whether error affects user experience

### User-Friendly Error Messages

Error messages displayed to users are:
- Clear and actionable
- Free of technical jargon
- Specific to the error condition
- Include guidance for resolution when applicable
- Localized for international users (future enhancement)

Developer-facing error details available in:
- Server logs (full stack traces)
- Development mode error responses
- Error tracking systems (Sentry, etc.)

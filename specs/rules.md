# API Rules and Standards

## General Rules

### Path Prefix
- All APIs must be under `/api/` path prefix
- Example: `/api/auth/login`, `/api/projects`, `/api/projects/:projectId/functions`

### Mockability Requirements
- All APIs must be mockable (no external API calls)
- All dependencies must be injectable/mockable
- Database operations must be abstracted through repository/service layers
- No direct external service calls (all external dependencies must be injected)
- All business logic must be testable in isolation

### Error Response Format
All error responses must follow this consistent format:
```json
{
  "error": "User-friendly error message"
}
```

### Request/Response Validation
- All requests must be validated using TypeBox or Zod schemas
- Validation must occur before any business logic execution
- Invalid requests must return 400 (Bad Request) with specific validation error messages
- Response schemas must be defined and validated (optional, but recommended)

### Status Code Conventions
- `200 OK`: Successful GET, PUT, DELETE operations
- `201 Created`: Successful POST operations that create resources
- `400 Bad Request`: Invalid request data, validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks permission for the requested operation
- `404 Not Found`: Resource does not exist or user does not have access
- `500 Internal Server Error`: Server-side errors (never expose internal details to client)

### Logging Requirements
- All API endpoints must log requests: `[INFO] <timestamp> <method> <endpoint> <user_id>`
- All errors must be logged: `[ERROR] <timestamp> <endpoint> <user_id> <error_message> <stack_trace>`
- Logging must include user context (user_id from JWT token)
- Sensitive data (passwords, tokens) must never be logged

### Error Handling Patterns
- All endpoints must use try-catch blocks
- Database errors must be caught and converted to user-friendly messages
- Never expose stack traces or internal error details to clients in production
- Transaction rollback must occur on any error during write operations
- Return appropriate HTTP status codes with error messages

### Transaction Management
- All write operations (POST, PUT, DELETE) must use database transactions
- Transactions must rollback on any error
- Use PostgreSQL BEGIN/COMMIT/ROLLBACK or connection pool transaction methods
- Nested transactions are not supported

### Authentication Requirements
- All endpoints except `/api/auth/register` and `/api/auth/login` require JWT authentication
- Token must be included in `Authorization` header: `Authorization: Bearer <token>`
- Token validation must occur before any business logic
- Invalid or expired tokens must return 401 (Unauthorized)

### Authorization Requirements
- All project-related endpoints must verify user access (ownership or permission)
- Permission checks must occur before data retrieval or modification
- Return 403 (Forbidden) if user lacks required permissions
- Project owners have full access (create, read, update, delete)
- Users with ProjectPermission have read access only (cannot modify project)

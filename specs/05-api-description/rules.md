# API Documentation Rules

## General Rules for All APIs

### 1. API Versioning
- All APIs are versioned under `/api/v1/`
- Version is included in the URL path
- Future breaking changes will increment version number

### 2. HTTP Methods
- **GET**: Retrieve resources (read-only operations)
- **POST**: Create new resources or perform actions
- **PUT**: Update existing resources (full replacement)
- **DELETE**: Remove resources

### 3. Request Format
- Content-Type: `application/json`
- All request bodies must be valid JSON
- Query parameters for filtering, pagination, and sorting
- Path parameters for resource identifiers

### 4. Response Format
- Content-Type: `application/json`
- All responses are JSON objects
- Success responses include requested data
- Error responses follow standardized error format

### 5. Status Codes
- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful POST operations that create resources
- **400 Bad Request**: Invalid request data, validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Authenticated but insufficient permissions
- **404 Not Found**: Resource does not exist
- **500 Internal Server Error**: Server-side errors

### 6. Error Response Structure
All error responses follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### 7. Authentication
- All protected endpoints require JWT token in Authorization header
- Format: `Authorization: Bearer <token>`
- Token expiration: 24 hours
- Refresh tokens stored in httpOnly cookies (7-day expiration)
- See `00-introduction.md` for detailed authentication mechanism

### 8. Authorization
- Resource ownership verification required for all operations
- Project permissions checked for project-related resources
- Permission checks performed before any data access or modification

### 9. Pagination
- List endpoints support pagination via query parameters
- Default limit: 50 items per page
- Parameters: `limit` (max 50), `offset` (default 0)
- Response includes pagination metadata

### 10. Validation
- All input data validated on server-side
- Validation errors return 400 status with specific field errors
- Required fields must be present and non-empty
- Data types must match specified schemas

### 11. Performance Requirements
- GET requests: < 200ms response time
- POST requests: < 300ms response time
- PUT requests: < 250ms response time
- DELETE requests: < 200ms response time
- All times measured at 95th percentile

### 12. Testing Requirements
- All APIs must be testable in isolation
- External dependencies must be abstracted and mockable
- No direct calls to external APIs
- All business logic testable without external services

### 13. Data Consistency
- All write operations use database transactions
- Rollback on any failure
- Strong consistency for all operations
- Optimistic locking for concurrent edits

### 14. Auto-Persistence
- Changes auto-saved with 500ms debounce
- No explicit save endpoints required
- All modifications persisted automatically
- Persistence confirmed in response

### 15. Resource Naming
- Use plural nouns for resource collections: `/projects`, `/functions`, `/bricks`
- Use singular nouns for individual resources: `/users/me`
- Nested resources follow hierarchy: `/projects/:id/functions`
- Use kebab-case for multi-word resources

### 16. Request ID
- All requests include `X-Request-ID` header (optional, auto-generated if missing)
- Request ID included in all log entries
- Request ID returned in response headers for tracing

### 17. CORS
- Allowed origins: Whitelist of production and development domains
- Credentials: Include cookies and authorization headers
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Preflight caching: 24 hours

### 18. Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Content-Security-Policy: Restrictive policy for script sources

### 19. Rate Limiting
- Rate limiting applied to prevent abuse
- Limits enforced per user/IP combination
- 429 Too Many Requests status code for rate limit exceeded
- Rate limit headers included in responses

### 20. Documentation Completeness
- Each API endpoint documented with:
  - Exact endpoint path
  - HTTP method
  - Request schema (all fields, types, validation rules, examples)
  - Response schema (success and error cases with examples)
  - Status codes
  - Error handling (specific codes and messages)
  - Authentication requirements
  - Authorization rules
  - Request/response examples

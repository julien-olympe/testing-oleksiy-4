# Development Constraints

## Reliability and Fault Tolerance

### Error Handling

**API Endpoint Error Handling:**
- All API endpoints must implement try-catch blocks for error handling
- Return appropriate HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
- Error responses must include JSON body with `error` field containing descriptive message
- Never expose internal error details (stack traces, database errors) to clients in production

**Database Transaction Management:**
- All write operations (INSERT, UPDATE, DELETE) must use database transactions
- Transactions must rollback on any error during execution
- Use PostgreSQL BEGIN/COMMIT/ROLLBACK or connection pool transaction methods
- Nested transactions are not supported; use savepoints if needed

**Brick Connection Validation:**
- Validate all brick connections before function execution
- Check that required inputs are connected (no unconnected required inputs)
- Verify output types match input types for all connections
- Validate that configuration values (e.g., database name) are set before execution
- Return validation errors if connections are invalid or incomplete

**User-Facing Error Messages:**
- Display user-friendly error messages in the UI
- Never show technical error details (database errors, stack traces) to end users
- Provide actionable error messages (e.g., "Database name is required" instead of "Validation failed")
- Use toast notifications or inline error messages for user feedback

**Error Logging:**
- Log all errors to console in development environment
- Log errors to file or logging service in production environment
- Include error context: user ID, endpoint, request parameters, stack trace
- Log format: `[ERROR] <timestamp> <endpoint> <user_id> <error_message> <stack_trace>`

## Security

### Authentication

**JWT-Based Authentication:**
- Use JSON Web Tokens (JWT) for user authentication
- Token expiration: 24 hours from issuance
- Token stored in HTTP-only cookie or localStorage (based on security requirements)
- Token payload includes: user ID, email, issued timestamp, expiration timestamp
- Refresh token mechanism is not required (users re-authenticate after expiration)

**Password Security:**
- Passwords must be hashed using bcrypt
- Salt rounds: 10 (bcrypt default)
- Never store plain text passwords
- Password validation: Minimum 8 characters (enforced client-side and server-side)
- Password reset functionality is not required in initial implementation

### Authorization

**User Isolation:**
- Users can only access projects they own or have explicit permissions for
- Enforce user isolation at database query level (WHERE clauses include user_id or permission checks)
- Never return project data without verifying user access rights
- Permission checks must occur before any data retrieval or modification

**Project Permission Enforcement:**
- Verify project ownership or ProjectPermission entry before allowing access
- Check permissions on every project-related API request
- Return 403 (Forbidden) if user lacks required permissions
- Project owners have full access (create, read, update, delete)
- Users with ProjectPermission have read access only (cannot modify project)

### Input Validation

**API Endpoint Validation:**
- Validate all input parameters on every API endpoint
- Use TypeBox or Zod schemas for request validation
- Reject requests with invalid data types, missing required fields, or out-of-range values
- Return 400 (Bad Request) with specific validation error messages

**SQL Injection Prevention:**
- Use parameterized queries for all database operations
- Never concatenate user input directly into SQL queries
- Use pg library's parameterized query methods exclusively
- Validate and sanitize all string inputs before database operations

### Network Security

**CORS Configuration:**
- Configure CORS to allow requests only from frontend domain
- Set appropriate CORS headers: Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers
- Restrict allowed methods to: GET, POST, PUT, DELETE, OPTIONS
- Do not use wildcard (*) for CORS origins in production

**HTTPS Requirement:**
- HTTPS is required in production environment
- All API endpoints must be served over HTTPS
- Frontend must be served over HTTPS
- HTTP to HTTPS redirect must be configured

## Standards and Methodologies

### Code Quality

**TypeScript Configuration:**
- TypeScript strict mode must be enabled (`"strict": true` in tsconfig.json)
- All files must use TypeScript (no JavaScript files except configuration)
- Type definitions required for all functions, variables, and API responses
- No `any` types allowed (use `unknown` with type guards if needed)

**Code Linting:**
- ESLint must be configured and enforced
- ESLint rules must include TypeScript-specific rules
- All code must pass ESLint checks before commit
- ESLint errors block deployment

**Code Formatting:**
- Prettier must be configured for consistent code formatting
- Format on save enabled in development environment
- Prettier configuration must be committed to repository
- All code must be formatted according to Prettier rules

### Version Control

**Git Workflow:**
- Git is used for version control
- Feature branches for new development
- Commit messages must be descriptive and follow conventional commit format
- Main branch is protected (no direct commits)
- Code review required before merge to main branch

### API Design

**RESTful API Design:**
- Follow REST principles for API endpoint design
- Use HTTP methods correctly: GET (read), POST (create), PUT (update), DELETE (delete)
- Use plural nouns for resource endpoints: `/api/projects`, `/api/functions`, `/api/databases`
- Nested resources: `/api/projects/:projectId/functions`, `/api/projects/:projectId/databases`
- Consistent response formats: JSON objects with consistent structure

**API Versioning:**
- API versioning is not required in initial implementation
- All endpoints use `/api/` prefix
- Future versioning strategy: `/api/v1/`, `/api/v2/` if needed

### Frontend Architecture

**Component-Based React Architecture:**
- Use functional components with React Hooks (no class components)
- Component composition over inheritance
- Reusable components for common UI elements (buttons, inputs, modals)
- Component files organized by feature (components, pages, hooks, utils folders)

**State Management:**
- React Context API for global state (authentication, user data)
- Local component state (useState) for component-specific state
- No external state management library required (Redux, MobX)

### Asynchronous Operations

**Async/Await Pattern:**
- Use async/await for all asynchronous operations
- Avoid Promise.then() chains in favor of async/await
- Proper error handling with try-catch blocks in async functions
- Database queries use async/await with pg library

### Database Consistency

**PostgreSQL Transactions:**
- Use transactions for all multi-step database operations
- Ensure data consistency with ACID properties
- Transaction isolation level: READ COMMITTED (PostgreSQL default)
- Rollback transactions on any error during execution

**Data Integrity:**
- Foreign key constraints enforced at database level
- Unique constraints on email, (project_id, user_id) combinations
- NOT NULL constraints on required fields
- Database-level validation for data types and constraints

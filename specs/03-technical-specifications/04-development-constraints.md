# Development Constraints

## Overview

This document defines the mandatory development constraints, standards, and methodologies for the visual programming application. All constraints are non-negotiable and must be enforced throughout development.

## Reliability and Fault Tolerance

### Error Handling

**Comprehensive Error Handling:**
- All API endpoints implement try-catch blocks, database operations wrapped in transaction handlers, async operations include error callbacks
- Unhandled promise rejections are caught and logged, error boundaries implemented in React components
- All errors logged with context (user ID, request ID, stack trace), severity levels: DEBUG, INFO, WARN, ERROR, CRITICAL
- Structured logging format (JSON) for parsing and analysis, sensitive data excluded from error logs (passwords, tokens)
- Graceful degradation when non-critical features fail, user-friendly error messages displayed to end users
- Automatic retry for transient failures (network, database), circuit breaker pattern for external service calls

### Transaction Management

**Database Transactions:**
- All multi-step operations use database transactions with rollback on any failure
- ACID compliance enforced for all write operations, deadlock detection and automatic retry with exponential backoff
- Single operations: Auto-commit enabled, multi-step operations: Explicit transaction boundaries
- Transaction timeout: 30 seconds maximum

### Validation

**API and UI Validation:**
- Input validation on all API endpoints, schema validation using Fastify, type checking for all request parameters and body
- Rejection of invalid requests with 400 status code
- Client-side validation for immediate user feedback, validation rules match server-side validation exactly
- Visual indicators for invalid fields (red borders, error messages), form submission prevented until all validations pass
- Database constraints enforce referential integrity, unique constraints prevent duplicate data
- Check constraints validate data ranges and formats, foreign key constraints prevent orphaned records

### Graceful Degradation

**Feature and Performance Degradation:**
- Core features (login, project access) always available, non-critical features degrade silently
- Visual editor works without real-time connections
- Response time increases logged but service continues, rate limiting prevents resource exhaustion
- Queue system for high-load operations, automatic scaling triggers on performance degradation

## Security

### Authentication

**JWT Authentication:**
- JSON Web Tokens for stateless authentication, token signing algorithm: HS256 with 256-bit secret key
- Token expiration: 24 hours for access tokens, refresh tokens: 7 days expiration, stored in httpOnly cookies
- Token revocation: Blacklist mechanism for logged-out tokens

**Password Security:**
- Password hashing: bcrypt with cost factor 12, minimum password length: 8 characters
- Password complexity: At least one uppercase, one lowercase, one number
- Password reset: Time-limited tokens (1 hour expiration), password history: Prevent reuse of last 5 passwords

### Authorization

**Row-Level Security and API Authorization:**
- PostgreSQL row-level security policies enforce data access, users can only access projects they own or have permissions for
- Database-level enforcement prevents API bypass attacks, policy testing in all database queries
- JWT token validation on all protected endpoints
- Resource ownership verification before operations, permission checks before project access

### Data Protection

**CORS Configuration:**
- Allowed origins: Whitelist of production and development domains, credentials: Include cookies and authorization headers
- Methods: GET, POST, PUT, DELETE, OPTIONS, headers: Content-Type, Authorization, preflight caching: 24 hours

**Input Sanitization and Injection Prevention:**
- All user inputs sanitized before database storage, HTML entity encoding for user-generated content
- SQL injection prevention via parameterized queries exclusively, no string concatenation in SQL queries
- pg (node-postgres) library enforces parameterization via parameterized queries, input validation before query construction

**XSS Prevention:**
- React automatically escapes user content in JSX, dangerous HTML rendering prohibited (no innerHTML)
- Content Security Policy (CSP) headers enforced, XSS filtering on all API inputs and outputs

**Security Headers:**
- X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains, Content-Security-Policy: Restrictive policy for script sources

## Standards and Methodologies

### TypeScript Configuration

**TypeScript Strict Mode:**
- strict: true (enables all strict type checking options), noImplicitAny, strictNullChecks, strictFunctionTypes: true
- noUnusedLocals, noUnusedParameters, noImplicitReturns: true, noFallthroughCasesInSwitch: true
- All code written in TypeScript (no JavaScript files), type definitions required for all functions and classes
- No use of `any` type without explicit justification, interface definitions for all data structures

### Code Formatting and Linting

**ESLint and Prettier:**
- ESLint 8.x with TypeScript plugin, Airbnb TypeScript style guide as base configuration
- Custom rules for project-specific patterns, pre-commit hooks enforce linting before commits
- Prettier 3.x for code formatting, integrated with ESLint via eslint-config-prettier
- Automatic formatting on save in IDE, formatting rules: 2 spaces indentation, single quotes, semicolons required, trailing commas, 100 character line length

### API Design

**RESTful API Design:**
- Resource-based URLs: /api/v1/resources/:id, HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
- Status codes: Standard HTTP status codes, versioning: URL-based versioning (/api/v1/)
- Pagination: Limit and offset parameters for list endpoints
- OpenAPI 3.0 specification for all endpoints, endpoint descriptions, parameters, and response schemas
- Example requests and responses, error response documentation

### Version Control

**Git Workflow:**
- Main branch: Production-ready code only, feature branches: feature/description-name format
- Commit messages: Conventional Commits format (type: feat, fix, docs, style, refactor, test, chore)
- Pull requests: Required for all changes, code review mandatory, branch protection: Main branch requires PR approval
- Example commit: "feat(api): add project creation endpoint"

### Containerization

**Docker Configuration:**
- Dockerfile for application container, docker-compose.yml for local development
- Multi-stage builds for optimized production images, .dockerignore to exclude unnecessary files
- Health checks defined for all containers, base images: Official Node.js and PostgreSQL images
- Non-root user for application containers, minimal image size: Optimize layer caching
- Environment variables for configuration

### Testing

**Unit and End-to-End Testing:**
- Jest framework for all unit tests, test coverage: Minimum 80% for all code
- Test files: *.test.ts or *.spec.ts naming convention, mock external dependencies (database, APIs)
- Test all business logic and utility functions
- Playwright framework for E2E tests, test critical user flows: Login, project creation, function execution
- Cross-browser testing: Chrome, Firefox, visual regression testing for UI components
- Test data cleanup after each test run, tests run in CI/CD pipeline before deployment
- All tests must pass before merge to main branch, flaky tests identified and fixed immediately
- Test isolation: No shared state between tests

### Code Review Process

**Review Requirements and Focus Areas:**
- Minimum one approval required for all PRs, automated checks must pass (linting, tests, type checking)
- Review checklist: Functionality, security, performance, maintainability
- Comments addressed before merge, no self-approval of own code
- Security vulnerabilities (SQL injection, XSS, authentication), performance implications (N+1 queries, inefficient algorithms)
- Code maintainability (readability, documentation, complexity), test coverage and quality
- Adherence to coding standards and patterns

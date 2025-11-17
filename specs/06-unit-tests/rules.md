# Unit Test Rules and Guidelines

## General Rules

### Test Framework
- All unit tests must use Jest testing framework
- Test files must follow naming convention: `*.test.ts` or `*.spec.ts`
- Tests must be isolated and independent - no shared state between tests
- Each test must clean up after itself (mocks, test data, database state)

### Test Structure
- Each test must have a clear, descriptive name that explains what is being tested
- Tests must follow Arrange-Act-Assert (AAA) pattern
- Setup and teardown must be explicit and documented
- Test data must be minimal and focused on the specific test case

### Coverage Requirements
- Minimum 80% code coverage for all code
- All business logic must be tested
- All API endpoints must have unit tests
- All validation logic must be tested
- All error handling paths must be tested

### Mocking and Stubbing
- External dependencies must be mocked (database, external APIs, file system)
- Database operations must use test database or in-memory database
- Authentication tokens must be mocked for protected endpoints
- Use minimal mocks - only mock what is necessary for the test

### Test Data
- Use factories or builders for test data creation
- Test data must be realistic but minimal
- Avoid hardcoded values - use constants or configuration
- Test data must be cleaned up after each test

### Assertions
- Use descriptive assertion messages
- Assert both positive and negative cases
- Verify all side effects (database changes, API calls, state changes)
- Check error messages and error codes

### Edge Cases and Boundary Testing
- Test minimum values (0, empty string, null)
- Test maximum values (from performance requirements)
- Test boundary values (min-1, max+1)
- Test invalid data types
- Test null/undefined values
- Test empty collections
- Test duplicate data
- Test non-existent resources

### Error Conditions
- Test all error paths
- Test validation failures
- Test permission denied scenarios
- Test database constraint violations
- Test transaction rollbacks
- Test authentication failures
- Test authorization failures
- Verify error messages are correct and user-friendly

### Performance Testing
- Test response time requirements (< 200ms for GET, < 300ms for POST)
- Test maximum limits (10,000 projects, 100 functions, 50 bricks)
- Test concurrent user scenarios
- Test transaction throughput limits
- Test function execution time limits (2 seconds max)

### Test Isolation
- Tests must not depend on execution order
- Tests must not share mutable state
- Each test must be able to run independently
- Database state must be reset between tests

### Documentation
- Each test must include:
  - Test name: Clear description of what is being tested
  - Description: Detailed explanation of the test scenario
  - Setup: Required test data, mocks, and initial state
  - Test Steps: Step-by-step actions to execute
  - Expected Results: What should happen and what should be verified
  - Test Data: Specific values used in the test
  - Mocks/Stubs: What external dependencies are mocked
  - Assertions: What is being verified

### Best Practices
- One assertion per test when possible (or related assertions)
- Test one behavior per test
- Use descriptive test names: `should return error when email is invalid`
- Group related tests using `describe` blocks
- Use `beforeEach` and `afterEach` for common setup/teardown
- Avoid test interdependencies
- Keep tests fast - unit tests should complete in milliseconds
- Tests must be deterministic - same input always produces same output

### TypeScript Requirements
- All tests must be written in TypeScript
- Use strict type checking
- No `any` types without justification
- Type all test data and mocks

### API Testing Rules
- Test all HTTP methods (GET, POST, PUT, DELETE)
- Test all status codes (200, 201, 400, 401, 403, 404, 500)
- Test request validation (required fields, data types, formats)
- Test response format and structure
- Test authentication and authorization
- Test error response format

### Database Testing Rules
- Use transactions that rollback after each test
- Test foreign key constraints
- Test unique constraints
- Test cascade deletes
- Test data integrity
- Test query performance with indexes

### Security Testing Rules
- Test authentication token validation
- Test authorization checks
- Test input sanitization
- Test SQL injection prevention
- Test XSS prevention
- Test CORS configuration
- Test security headers

# Unit Test Rules and Guidelines

## Test Framework Setup

### Framework
- **Testing Framework**: Jest (as specified in technical specifications)
- **Test Runner**: Jest CLI
- **Test Environment**: Node.js
- **TypeScript Support**: ts-jest or @jest/globals with TypeScript configuration

### Test File Naming Convention
- All test files must end with `.test.ts` or `.spec.ts`
- Test files should be co-located with source files or in a `__tests__` directory
- Example: `user-registration.test.ts`, `create-project.test.ts`

### Test Structure
Each test file must follow this structure:
```typescript
describe('Feature/Component Name', () => {
  describe('Method/Function Name', () => {
    beforeEach(() => {
      // Setup code
    });

    afterEach(() => {
      // Cleanup code
    });

    it('should [expected behavior] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Mocking Patterns

### Database Mocking
- **PostgreSQL Mocking**: Use `pg` library mocking or connection pool mocking
- Mock database queries using Jest mocks: `jest.mock('pg')`
- Mock connection pool methods: `query()`, `connect()`, `release()`
- Return mock data that matches actual database schema structure
- Example:
```typescript
const mockQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockQuery,
    connect: jest.fn(),
    end: jest.fn(),
  })),
}));
```

### Authentication Mocking
- Mock JWT token generation and validation
- Mock bcrypt password hashing: `jest.mock('bcrypt')`
- Mock session management and token storage
- Example:
```typescript
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve('hashed_password')),
  compare: jest.fn((password, hash) => Promise.resolve(true)),
}));
```

### API Endpoint Mocking
- Mock Fastify request/response objects
- Mock request headers, body, params, and query parameters
- Mock response methods: `send()`, `status()`, `code()`
- Example:
```typescript
const mockRequest = {
  headers: { authorization: 'Bearer token' },
  body: { email: 'test@example.com' },
  params: { id: 'uuid' },
};
const mockReply = {
  send: jest.fn(),
  status: jest.fn().mockReturnThis(),
  code: jest.fn().mockReturnThis(),
};
```

### External Service Mocking
- Mock all external dependencies (database, authentication, file system)
- Use `jest.mock()` at the top of test files
- Provide default mock implementations that can be overridden per test

## Test Structure

### Test Organization
- Group related tests using `describe` blocks
- Use nested `describe` blocks for sub-features
- Each `it` block should test a single behavior
- Test names should be descriptive and follow the pattern: "should [expected behavior] when [condition]"

### Test Categories
1. **Positive Tests**: Test successful execution paths
2. **Negative Tests**: Test error conditions and validation failures
3. **Edge Cases**: Test boundary conditions, empty values, null values, maximum lengths
4. **Integration Tests**: Test interactions between multiple components (separate from unit tests)

### Arrange-Act-Assert Pattern
Every test must follow the AAA pattern:
- **Arrange**: Set up test data, mocks, and preconditions
- **Act**: Execute the function/method being tested
- **Assert**: Verify the expected outcome

## Assertion Patterns

### Jest Assertions
- Use Jest's built-in matchers: `expect()`, `toBe()`, `toEqual()`, `toHaveBeenCalled()`
- Use appropriate matchers for the data type:
  - `toBe()` for primitives and object identity
  - `toEqual()` for object/array equality
  - `toHaveBeenCalledWith()` for function call verification
  - `toMatchObject()` for partial object matching
  - `toThrow()` for error testing

### Error Assertions
- Test error messages: `expect(() => fn()).toThrow('Error message')`
- Test error types: `expect(() => fn()).toThrow(Error)`
- Test HTTP status codes: `expect(reply.status).toHaveBeenCalledWith(400)`

### Async Assertions
- Use `async/await` for async tests: `it('should...', async () => { ... })`
- Use `resolves`/`rejects` matchers: `await expect(promise).resolves.toBe(value)`
- Ensure all promises are awaited or returned

## Test Data Factories

### Factory Functions
Create factory functions for generating test data:
```typescript
const createMockUser = (overrides = {}) => ({
  id: 'user-uuid',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const createMockProject = (overrides = {}) => ({
  id: 'project-uuid',
  name: 'Test Project',
  owner_id: 'user-uuid',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});
```

### UUID Generation
- Use consistent UUIDs in tests for predictable results
- Use `uuid` library or hardcoded test UUIDs
- Example: `'550e8400-e29b-41d4-a716-446655440000'`

### Date Handling
- Use fixed dates in tests for consistency
- Mock `Date.now()` if time-dependent logic is tested
- Use `new Date('2024-01-01T00:00:00Z')` for consistent timestamps

## Isolation Requirements

### Test Independence
- Each test must be independent and not rely on other tests
- Tests can run in any order without affecting each other
- Use `beforeEach` and `afterEach` to reset state between tests

### Database Isolation
- Each test must use a fresh database state (mocked or test database)
- Clean up test data after each test
- Use transactions that rollback after tests

### Mock Reset
- Reset all mocks between tests: `jest.clearAllMocks()` in `beforeEach`
- Reset mock implementations: `mockFn.mockReset()`
- Clear mock call history: `mockFn.mockClear()`

### State Isolation
- Do not share mutable state between tests
- Create new instances of objects for each test
- Avoid global variables that persist between tests

## Common Test Utilities

### Test Helpers
Create utility functions for common test operations:
```typescript
// test-utils.ts
export const createMockRequest = (overrides = {}) => ({
  headers: {},
  body: {},
  params: {},
  query: {},
  ...overrides,
});

export const createMockReply = () => ({
  send: jest.fn(),
  status: jest.fn().mockReturnThis(),
  code: jest.fn().mockReturnThis(),
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-uuid',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  ...overrides,
});
```

### Validation Helpers
Create helpers for testing validation:
```typescript
export const expectValidationError = (reply, message) => {
  expect(reply.status).toHaveBeenCalledWith(400);
  expect(reply.send).toHaveBeenCalledWith({ error: message });
};
```

### Database Query Helpers
Create helpers for mocking database queries:
```typescript
export const mockQueryResult = (rows) => ({
  rows,
  rowCount: rows.length,
});

export const mockEmptyQueryResult = () => ({
  rows: [],
  rowCount: 0,
});
```

## Error Condition Testing

### Required Error Tests
Every API endpoint must test:
1. **Invalid Input**: Missing required fields, wrong data types, invalid formats
2. **Unauthorized Access**: Missing or invalid authentication tokens
3. **Forbidden Access**: Valid token but insufficient permissions
4. **Resource Not Found**: Requesting non-existent resources
5. **Database Errors**: Connection failures, constraint violations
6. **Boundary Conditions**: Empty strings, null values, maximum lengths, negative numbers

### Error Message Validation
- Verify error messages match specifications exactly
- Test that error messages are user-friendly (not technical)
- Ensure error messages are returned in correct format: `{ error: "message" }`

## Performance Testing

### Response Time Tests
- Test that API endpoints respond within 200ms (as per performance requirements)
- Use `jest.setTimeout()` for longer-running tests
- Mock database queries to return immediately for unit tests

### Limit Tests
- Test maximum capacity limits (1000 projects, 500 functions, 100 bricks, etc.)
- Test boundary conditions at limits (exactly at limit, one over limit)
- Verify appropriate error messages when limits are exceeded

## Code Coverage

### Coverage Requirements
- Aim for 80%+ code coverage for critical paths
- Cover all error conditions and edge cases
- Cover all API endpoints and their behaviors
- Use `--coverage` flag to generate coverage reports

### Coverage Exclusions
- Exclude test files from coverage
- Exclude configuration files
- Exclude type definition files

## Best Practices

### Test Readability
- Use descriptive test names that explain what is being tested
- Keep tests focused on a single behavior
- Use comments sparingly; code should be self-documenting
- Group related assertions together

### Test Maintainability
- Refactor common setup code into helper functions
- Use factory functions for test data creation
- Keep tests DRY (Don't Repeat Yourself) but prioritize clarity
- Update tests when requirements change

### Test Performance
- Keep unit tests fast (< 100ms per test)
- Use mocks instead of real database connections
- Avoid unnecessary async operations in unit tests
- Run tests in parallel when possible

### Test Reliability
- Avoid flaky tests (tests that sometimes pass, sometimes fail)
- Do not rely on timing or external services
- Use deterministic test data
- Mock all external dependencies

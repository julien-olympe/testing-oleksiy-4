# Create Project Unit Test Specification

## Test File: `create-project.test.ts`

### Purpose
Test the create project functionality, including successful creation, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/projects` endpoint
- Create project service/function
- Project name generation (default names)
- User ownership assignment
- Database project creation

### Test Cases

#### Test Case 1: Successful Project Creation
**Test Name**: `should create a new project with default name when valid user is authenticated`

**Description**: Verifies that an authenticated user can successfully create a new project.

**Setup**:
- Mock authentication middleware to return valid user
- Mock database connection pool
- Mock database INSERT query to return new project record
- Mock user ID from authentication token

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {} // No body required, default name will be generated
```

**Actions**:
1. Call create project endpoint with authenticated user
2. Verify user is authenticated
3. Verify default project name is generated (e.g., "New Project" or "Project 1")
4. Verify project record is created in database with:
   - Generated name
   - owner_id matching authenticated user ID
   - UUID for id
   - Timestamps for created_at and updated_at
5. Verify response includes created project

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body: `{ id: "project-uuid", name: "New Project", owner_id: "user-uuid", created_at: "timestamp", updated_at: "timestamp" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT'),
  expect.arrayContaining([
    expect.any(String), // UUID
    expect.stringMatching(/^(New Project|Project \d+)$/), // Default name pattern
    'user-uuid', // owner_id
    expect.any(Date), // created_at
    expect.any(Date) // updated_at
  ])
);
expect(reply.status).toHaveBeenCalledWith(201);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  id: expect.any(String),
  name: expect.stringMatching(/^(New Project|Project \d+)$/),
  owner_id: 'user-uuid',
  created_at: expect.any(String),
  updated_at: expect.any(String)
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Create Project with Custom Name
**Test Name**: `should create a new project with custom name when provided in request body`

**Description**: Verifies that a project can be created with a custom name if provided.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database INSERT query

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {
  name: 'My Custom Project'
}
```

**Actions**:
1. Call create project endpoint with custom name
2. Verify project is created with provided name
3. Verify response includes project with custom name

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body: `{ id: "project-uuid", name: "My Custom Project", owner_id: "user-uuid", ... }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT'),
  expect.arrayContaining([
    expect.any(String),
    'My Custom Project',
    'user-uuid',
    expect.any(Date),
    expect.any(Date)
  ])
);
expect(reply.status).toHaveBeenCalledWith(201);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  name: 'My Custom Project'
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 3: Create Project Without Authentication
**Test Name**: `should return error when project creation is attempted without authentication`

**Description**: Verifies that project creation fails when user is not authenticated.

**Setup**:
- Mock request without authorization header
- Mock authentication middleware to reject request

**Inputs**:
```typescript
Headers: {}
Body: {}
```

**Actions**:
1. Call create project endpoint without authentication
2. Verify authentication middleware rejects request
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Unauthorized" }` or `{ error: "Authentication required" }`

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(401);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Unauthorized')
}));
```

**Error Conditions**: Missing authentication

---

#### Test Case 4: Create Project with Empty Name
**Test Name**: `should return error when project name is empty string`

**Description**: Verifies that project creation fails when name is an empty string.

**Setup**:
- Mock authentication middleware
- Mock database connection pool

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {
  name: ''
}
```

**Actions**:
1. Call create project endpoint with empty name
2. Verify validation detects empty name
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name cannot be empty" }`

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith({ error: "Project name cannot be empty" });
```

**Error Conditions**: Empty name validation

---

#### Test Case 5: Create Project with Null Name
**Test Name**: `should return error when project name is null`

**Description**: Verifies that project creation fails when name is null.

**Setup**:
- Mock authentication middleware
- Mock database connection pool

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {
  name: null
}
```

**Actions**:
1. Call create project endpoint with null name
2. Verify validation detects null name
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name is required" }` or `{ error: "Project name cannot be empty" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('name')
}));
```

**Error Conditions**: Null name validation

---

#### Test Case 6: Create Project with Maximum Length Name
**Test Name**: `should create project when name is at maximum length (255 characters)`

**Description**: Verifies that project creation succeeds with name at database maximum length.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database INSERT query

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {
  name: 'A'.repeat(255)
}
```

**Actions**:
1. Call create project endpoint with maximum length name
2. Verify project is created successfully
3. Verify response includes project with maximum length name

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body includes project with 255-character name

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT'),
  expect.arrayContaining([
    expect.any(String),
    expect.stringMatching(/^.{255}$/),
    'user-uuid',
    expect.any(Date),
    expect.any(Date)
  ])
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: None (positive test case)

---

#### Test Case 7: Create Project with Name Exceeding Maximum Length
**Test Name**: `should return error when project name exceeds maximum length (256+ characters)`

**Description**: Verifies that project creation fails when name exceeds database maximum length.

**Setup**:
- Mock authentication middleware
- Mock database connection pool

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {
  name: 'A'.repeat(256)
}
```

**Actions**:
1. Call create project endpoint with name exceeding maximum length
2. Verify validation detects length violation
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name cannot exceed 255 characters" }`

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('255')
}));
```

**Error Conditions**: Name length exceeds maximum

---

#### Test Case 8: Create Project with Database Error
**Test Name**: `should return error when database operation fails`

**Description**: Verifies that project creation handles database errors gracefully.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database query to throw error

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {}
```

**Actions**:
1. Call create project endpoint
2. Simulate database error (connection failure, constraint violation, etc.)
3. Verify error is caught and handled
4. Verify appropriate error response is returned

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Project creation failed" }` or generic error message

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(500);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
expect(reply.send).toHaveBeenCalledWith(expect.not.objectContaining({
  error: expect.stringContaining('SQL')
})); // Should not expose SQL errors
```

**Error Conditions**: Database operation failure

---

#### Test Case 9: Create Project When User Reaches Project Limit
**Test Name**: `should return error when user has reached maximum project limit (1000 projects)`

**Description**: Verifies that project creation fails when user has reached the maximum number of projects (1000).

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database query to count user's projects (returns 1000)
- Mock database INSERT query (should not be called)

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {}
```

**Actions**:
1. Call create project endpoint
2. Verify system checks current project count for user
3. Verify project count equals or exceeds 1000
4. Verify error response is returned
5. Verify project creation is not attempted

**Expected Outputs**:
- HTTP status: 400 (Bad Request) or 403 (Forbidden)
- Response body: `{ error: "Maximum project limit reached (1000 projects)" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT'),
  expect.arrayContaining(['user-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('INSERT')
);
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('1000')
}));
```

**Error Conditions**: Project limit reached

---

#### Test Case 10: Create Project with Whitespace-Only Name
**Test Name**: `should return error when project name contains only whitespace`

**Description**: Verifies that project creation fails when name contains only whitespace characters.

**Setup**:
- Mock authentication middleware
- Mock database connection pool

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Body: {
  name: '   '
}
```

**Actions**:
1. Call create project endpoint with whitespace-only name
2. Verify validation trims and detects empty name
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name cannot be empty" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('empty')
}));
```

**Error Conditions**: Whitespace-only name validation

---

### Mock Setup Requirements

```typescript
// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret) => {
    if (token === 'valid_jwt_token') {
      return { userId: 'user-uuid', email: 'user@example.com' };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock PostgreSQL
const mockQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockQuery,
    connect: jest.fn(),
    end: jest.fn(),
  })),
}));

// Mock request/reply
const createMockRequest = (body = {}, headers = {}) => ({
  headers: {
    authorization: 'Bearer valid_jwt_token',
    ...headers,
  },
  body,
  params: {},
  query: {},
});

const createMockReply = () => ({
  send: jest.fn(),
  status: jest.fn().mockReturnThis(),
  code: jest.fn().mockReturnThis(),
});
```

### Test Data Factories

```typescript
const createMockProject = (overrides = {}) => ({
  id: 'project-uuid',
  name: 'Test Project',
  owner_id: 'user-uuid',
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createProjectRequestBody = (name?: string) => {
  if (name !== undefined) {
    return { name };
  }
  return {};
};
```

### Error Condition Summary
- Missing authentication
- Empty name
- Null name
- Name exceeding maximum length (256+ characters)
- Whitespace-only name
- Database errors
- Project limit reached (1000 projects)

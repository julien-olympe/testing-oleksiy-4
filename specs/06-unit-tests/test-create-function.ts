# Create Function Unit Test Specification

## Test File: `create-function.test.ts`

### Purpose
Test the create function functionality within a project, including successful creation, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/functions` endpoint
- Create function service/function
- Project access permission verification
- Function name generation (default names)
- Database function creation

### Test Cases

#### Test Case 1: Successful Function Creation
**Test Name**: `should create a new function with default name when user has project access`

**Description**: Verifies that a user with project access can successfully create a new function.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database query to verify project access
- Mock database INSERT query to return new function record

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: {} // No body required, default name will be generated
```

**Actions**:
1. Call create function endpoint with valid project ID
2. Verify user has access to project (owner or has permission)
3. Verify default function name is generated (e.g., "New Function" or "Function 1")
4. Verify function record is created in database
5. Verify response includes created function

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body: `{ id: "function-uuid", name: "New Function", project_id: "project-uuid", ... }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM projects'),
  expect.arrayContaining(['project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO functions'),
  expect.arrayContaining([
    expect.any(String), // UUID
    expect.stringMatching(/^(New Function|Function \d+)$/),
    'project-uuid',
    expect.any(Date),
    expect.any(Date)
  ])
);
expect(reply.status).toHaveBeenCalledWith(201);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  id: expect.any(String),
  name: expect.stringMatching(/^(New Function|Function \d+)$/),
  project_id: 'project-uuid'
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Create Function Without Project Access
**Test Name**: `should return error when user attempts to create function without project access`

**Description**: Verifies that function creation fails when user has no access to project.

**Setup**:
- Mock authentication middleware
- Mock database query to return no project access

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'other-user-project-uuid' }
Body: {}
```

**Actions**:
1. Call create function endpoint
2. Verify project access check fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 403 (Forbidden)
- Response body: `{ error: "Access denied" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(403);
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO functions')
);
```

**Error Conditions**: User lacks project access

---

#### Test Case 3: Create Function When Function Limit Reached
**Test Name**: `should return error when project has reached maximum function limit (500 functions)`

**Description**: Verifies that function creation fails when project has 500 functions.

**Setup**:
- Mock authentication middleware
- Mock database query to count functions (returns 500)
- Mock database query to verify project access

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: {}
```

**Actions**:
1. Call create function endpoint
2. Verify function count equals 500
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum function limit reached (500 functions)" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT'),
  expect.arrayContaining(['project-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('500')
}));
```

**Error Conditions**: Function limit reached

---

#### Test Case 4: Create Function with Database Error
**Test Name**: `should return error when database operation fails`

**Description**: Verifies that function creation handles database errors gracefully.

**Setup**:
- Mock authentication middleware
- Mock database query to throw error

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: {}
```

**Actions**:
1. Call create function endpoint
2. Simulate database error
3. Verify error is caught and handled

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Function creation failed" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(500);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Database operation failure

---

### Mock Setup Requirements

```typescript
// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token) => ({ userId: 'user-uuid', email: 'user@example.com' })),
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
```

### Error Condition Summary
- Missing authentication
- User lacks project access
- Function limit reached (500 functions)
- Database errors

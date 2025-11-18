# View Projects Unit Test Specification

## Test File: `view-projects.test.ts`

### Purpose
Test the view projects functionality, including successful retrieval, user isolation, pagination, and edge cases.

### Functions/APIs Being Tested
- `GET /api/projects` endpoint
- View projects service/function
- User isolation enforcement
- Pagination support (when > 50 projects)

### Test Cases

#### Test Case 1: Successful View Projects
**Test Name**: `should return list of user's projects when authenticated`

**Description**: Verifies that an authenticated user can view their own projects.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database query to return user's projects

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Query: {} // No pagination parameters
```

**Actions**:
1. Call view projects endpoint
2. Verify user is authenticated
3. Verify database query filters by owner_id (user isolation)
4. Verify response includes project list

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ projects: [{ id: "uuid", name: "Project 1", owner_id: "user-uuid", ... }, ...] }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('WHERE owner_id'),
  expect.arrayContaining(['user-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  projects: expect.arrayContaining([
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      owner_id: 'user-uuid'
    })
  ])
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: View Projects Without Authentication
**Test Name**: `should return error when projects are requested without authentication`

**Description**: Verifies that viewing projects fails when user is not authenticated.

**Setup**:
- Mock request without authorization header

**Inputs**:
```typescript
Headers: {}
Query: {}
```

**Actions**:
1. Call view projects endpoint without authentication
2. Verify authentication middleware rejects request
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Unauthorized" }`

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(401);
```

**Error Conditions**: Missing authentication

---

#### Test Case 3: View Projects with Empty List
**Test Name**: `should return empty list when user has no projects`

**Description**: Verifies that viewing projects returns empty list when user has no projects.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Query: {}
```

**Actions**:
1. Call view projects endpoint
2. Verify database query returns empty result
3. Verify response includes empty projects array

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ projects: [] }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith({ projects: [] });
```

**Error Conditions**: None (positive test case - empty state)

---

#### Test Case 4: View Projects with Pagination
**Test Name**: `should return paginated projects when user has more than 50 projects`

**Description**: Verifies that projects are paginated when user has more than 50 projects.

**Setup**:
- Mock authentication middleware
- Mock database query to return paginated results
- Mock database query to count total projects

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Query: {
  page: 1,
  limit: 50
}
```

**Actions**:
1. Call view projects endpoint with pagination parameters
2. Verify database query includes LIMIT and OFFSET
3. Verify response includes pagination metadata

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ projects: [...], pagination: { page: 1, limit: 50, total: 100, totalPages: 2 } }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('LIMIT'),
  expect.arrayContaining([50, 0]) // limit, offset
);
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  projects: expect.any(Array),
  pagination: expect.objectContaining({
    page: 1,
    limit: 50,
    total: expect.any(Number),
    totalPages: expect.any(Number)
  })
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 5: View Projects User Isolation
**Test Name**: `should only return projects owned by authenticated user`

**Description**: Verifies that user isolation is enforced - users only see their own projects.

**Setup**:
- Mock authentication middleware
- Mock database query to return only user's projects
- Create test data with projects from multiple users

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Query: {}
```

**Actions**:
1. Call view projects endpoint
2. Verify database query includes WHERE owner_id = user-uuid
3. Verify response only includes projects owned by authenticated user
4. Verify no projects from other users are included

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body contains only projects with owner_id matching authenticated user

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('WHERE owner_id = $1'),
  expect.arrayContaining(['user-uuid'])
);
const response = reply.send.mock.calls[0][0];
response.projects.forEach(project => {
  expect(project.owner_id).toBe('user-uuid');
});
```

**Error Conditions**: None (positive test case - security verification)

---

#### Test Case 6: View Projects with Invalid Page Number
**Test Name**: `should return error when page number is invalid`

**Description**: Verifies that pagination fails when page number is invalid (negative, zero, or non-numeric).

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Query: { page: -1 }
```

**Actions**:
1. Call view projects endpoint with invalid page number
2. Verify validation detects invalid page
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid page number" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('page')
}));
```

**Error Conditions**: Invalid pagination parameter

---

#### Test Case 7: View Projects with Invalid Limit
**Test Name**: `should return error when limit exceeds maximum (100)`

**Description**: Verifies that pagination fails when limit exceeds maximum allowed value.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Query: { limit: 200 }
```

**Actions**:
1. Call view projects endpoint with limit exceeding maximum
2. Verify validation detects limit violation
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Limit cannot exceed 100" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('limit')
}));
```

**Error Conditions**: Invalid pagination parameter

---

#### Test Case 8: View Projects with Database Error
**Test Name**: `should return error when database query fails`

**Description**: Verifies that viewing projects handles database errors gracefully.

**Setup**:
- Mock authentication middleware
- Mock database query to throw error

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Query: {}
```

**Actions**:
1. Call view projects endpoint
2. Simulate database error
3. Verify error is caught and handled

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Failed to retrieve projects" }` or generic error message

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

const createMockProjectsList = (count, ownerId = 'user-uuid') => {
  return Array.from({ length: count }, (_, i) => createMockProject({
    id: `project-uuid-${i}`,
    name: `Project ${i + 1}`,
    owner_id: ownerId,
  }));
};
```

### Error Condition Summary
- Missing authentication
- Invalid pagination parameters (page, limit)
- Database errors

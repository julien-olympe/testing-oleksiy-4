# Project Limit Unit Test Specification

## Test File: `project-limit.test.ts`

### Purpose
Test the project limit functionality, verifying that users cannot exceed the maximum of 1000 projects per user.

### Functions/APIs Being Tested
- `POST /api/projects` endpoint (create project)
- Project limit enforcement
- Project count verification

### Test Cases

#### Test Case 1: Create Project at Limit Boundary
**Test Name**: `should successfully create project when user has exactly 999 projects`

**Description**: Verifies that project creation succeeds when user is one project below the limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count projects (returns 999)
- Mock database INSERT for project

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Body: {}
```

**Actions**:
1. Count user's projects (returns 999)
2. Verify count < 1000
3. Create project
4. Verify project is created successfully

**Expected Outputs**:
- HTTP status: 201 (Created)
- Project created successfully

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT'),
  expect.arrayContaining(['user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO projects')
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Create Project at Maximum Limit
**Test Name**: `should return error when user attempts to create project and already has 1000 projects`

**Description**: Verifies that project creation fails when user has reached the maximum limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count projects (returns 1000)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Body: {}
```

**Actions**:
1. Count user's projects (returns 1000)
2. Verify count >= 1000
3. Reject project creation
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum project limit reached (1000 projects)" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT'),
  expect.arrayContaining(['user-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO projects')
);
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('1000')
}));
```

**Error Conditions**: Project limit reached

---

#### Test Case 3: Create Project Exceeding Limit
**Test Name**: `should return error when user attempts to create project and has more than 1000 projects`

**Description**: Verifies that project creation fails when user exceeds the limit (edge case).

**Setup**:
- Mock authentication middleware
- Mock database query to count projects (returns 1001)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Body: {}
```

**Actions**:
1. Count user's projects (returns 1001)
2. Verify count > 1000
3. Reject project creation
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum project limit reached (1000 projects)" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('1000')
}));
```

**Error Conditions**: Project limit exceeded

---

#### Test Case 4: Project Limit Includes Shared Projects
**Test Name**: `should count both owned and shared projects toward limit`

**Description**: Verifies that the 1000 project limit includes both owned projects and projects shared via permissions.

**Setup**:
- Mock authentication middleware
- Mock database query to count owned projects + projects with permissions

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Body: {}
```

**Actions**:
1. Count owned projects
2. Count projects with permissions
3. Sum both counts
4. Verify total < 1000 before allowing creation

**Expected Outputs**:
- HTTP status: 201 (Created) if total < 1000
- HTTP status: 400 (Bad Request) if total >= 1000

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT.*FROM projects'),
  expect.arrayContaining(['user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT.*FROM project_permissions'),
  expect.arrayContaining(['user-uuid'])
);
```

**Error Conditions**: Total project count (owned + shared) >= 1000

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

### Performance Requirements
- Maximum projects per user: 1000
- Project list queries must paginate when exceeding 50 projects per page
- Limit check must complete within 200ms

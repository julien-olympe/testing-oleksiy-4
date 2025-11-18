# Open Project Editor Unit Test Specification

## Test File: `open-project.test.ts`

### Purpose
Test the open project editor functionality, including successful opening, permission checks, and edge cases.

### Functions/APIs Being Tested
- `GET /api/projects/:projectId` endpoint
- Open project service/function
- Project access permission verification (ownership or ProjectPermission)
- Loading project data, functions, permissions, and databases

### Test Cases

#### Test Case 1: Successful Open Project (Owner)
**Test Name**: `should return project data when user owns the project`

**Description**: Verifies that a project owner can successfully open their project editor.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database queries to return:
  - Project data
  - Functions in project
  - Permissions for project
  - Databases in project

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Params: {
  projectId: 'project-uuid'
}
```

**Actions**:
1. Call open project endpoint with valid project ID
2. Verify user is authenticated
3. Verify project exists and user owns it
4. Verify project data is loaded
5. Verify functions are loaded
6. Verify permissions are loaded
7. Verify databases are loaded
8. Verify response includes all project data

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ project: {...}, functions: [...], permissions: [...], databases: [...] }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['project-uuid', 'user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM functions'),
  expect.arrayContaining(['project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM project_permissions'),
  expect.arrayContaining(['project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM databases'),
  expect.arrayContaining(['project-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  project: expect.objectContaining({
    id: 'project-uuid',
    name: expect.any(String),
    owner_id: 'user-uuid'
  }),
  functions: expect.any(Array),
  permissions: expect.any(Array),
  databases: expect.any(Array)
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Successful Open Project (With Permission)
**Test Name**: `should return project data when user has permission but does not own project`

**Description**: Verifies that a user with ProjectPermission can open a project they don't own.

**Setup**:
- Mock authentication middleware
- Mock database queries to return:
  - Project owned by different user
  - ProjectPermission entry for authenticated user

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'shared-project-uuid' }
```

**Actions**:
1. Call open project endpoint
2. Verify project exists but user doesn't own it
3. Verify ProjectPermission entry exists for user
4. Verify project data is loaded
5. Verify response includes project data

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body includes project data

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM projects'),
  expect.arrayContaining(['shared-project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM project_permissions'),
  expect.arrayContaining(['shared-project-uuid', 'user-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(200);
```

**Error Conditions**: None (positive test case)

---

#### Test Case 3: Open Project Without Authentication
**Test Name**: `should return error when project access is attempted without authentication`

**Description**: Verifies that opening a project fails when user is not authenticated.

**Setup**:
- Mock request without authorization header

**Inputs**:
```typescript
Headers: {}
Params: { projectId: 'project-uuid' }
```

**Actions**:
1. Call open project endpoint without authentication
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

#### Test Case 4: Open Project User Doesn't Have Access
**Test Name**: `should return error when user attempts to access project without permission`

**Description**: Verifies that opening a project fails when user has no access (doesn't own and has no permission).

**Setup**:
- Mock authentication middleware
- Mock database query to return project owned by different user
- Mock database query to return no ProjectPermission entry

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'other-user-project-uuid' }
```

**Actions**:
1. Call open project endpoint
2. Verify project exists but user doesn't own it
3. Verify no ProjectPermission entry exists
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 403 (Forbidden)
- Response body: `{ error: "Access denied" }` or `{ error: "You do not have permission to access this project" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM projects'),
  expect.arrayContaining(['other-user-project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM project_permissions'),
  expect.arrayContaining(['other-user-project-uuid', 'user-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(403);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Access denied')
}));
```

**Error Conditions**: User lacks access permission

---

#### Test Case 5: Open Non-Existent Project
**Test Name**: `should return error when project does not exist`

**Description**: Verifies that opening a project fails when project ID doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result (project not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'non-existent-uuid' }
```

**Actions**:
1. Call open project endpoint with non-existent project ID
2. Verify project lookup returns no results
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 404 (Not Found)
- Response body: `{ error: "Project not found" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM projects'),
  expect.arrayContaining(['non-existent-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(404);
expect(reply.send).toHaveBeenCalledWith({ error: "Project not found" });
```

**Error Conditions**: Project not found

---

#### Test Case 6: Open Project with Empty Project ID
**Test Name**: `should return error when project ID is empty string`

**Description**: Verifies that opening a project fails when project ID is empty.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: '' }
```

**Actions**:
1. Call open project endpoint with empty project ID
2. Verify validation detects empty ID
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project ID is required" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('ID')
}));
```

**Error Conditions**: Empty project ID

---

#### Test Case 7: Open Project with Invalid Project ID Format
**Test Name**: `should return error when project ID is not a valid UUID`

**Description**: Verifies that opening a project fails when project ID is not a valid UUID format.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'invalid-uuid-format' }
```

**Actions**:
1. Call open project endpoint with invalid UUID format
2. Verify UUID validation fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid project ID format" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Invalid UUID format

---

#### Test Case 8: Open Project with Database Error
**Test Name**: `should return error when database query fails`

**Description**: Verifies that opening a project handles database errors gracefully.

**Setup**:
- Mock authentication middleware
- Mock database query to throw error

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
```

**Actions**:
1. Call open project endpoint
2. Simulate database error
3. Verify error is caught and handled

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Failed to load project" }` or generic error message

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

const createMockFunction = (overrides = {}) => ({
  id: 'function-uuid',
  name: 'Test Function',
  project_id: 'project-uuid',
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createMockPermission = (overrides = {}) => ({
  id: 'permission-uuid',
  project_id: 'project-uuid',
  user_id: 'user-uuid',
  created_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createMockDatabase = (overrides = {}) => ({
  id: 'database-uuid',
  name: 'default database',
  project_id: 'project-uuid',
  schema_definition: { string_prop: 'string' },
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});
```

### Error Condition Summary
- Missing authentication
- User lacks access permission (doesn't own and has no permission)
- Project not found
- Empty project ID
- Invalid UUID format
- Database errors

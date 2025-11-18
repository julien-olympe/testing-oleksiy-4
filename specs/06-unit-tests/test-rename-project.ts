# Rename Project Unit Test Specification

## Test File: `rename-project.test.ts`

### Purpose
Test the rename project functionality, including successful renaming, validation errors, and edge cases.

### Functions/APIs Being Tested
- `PUT /api/projects/:projectId` endpoint
- Rename project service/function
- Project ownership verification
- Name uniqueness validation (within user's projects)

### Test Cases

#### Test Case 1: Successful Project Rename
**Test Name**: `should rename project when user owns project and provides valid new name`

**Description**: Verifies that a project owner can successfully rename their project.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database query to return existing project owned by user
- Mock database UPDATE query to return updated project

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Params: {
  projectId: 'project-uuid'
}
Body: {
  name: 'Renamed Project'
}
```

**Actions**:
1. Call rename project endpoint with valid project ID and new name
2. Verify user is authenticated
3. Verify project exists and user owns it
4. Verify new name is not empty
5. Verify new name doesn't conflict with existing project names for the user
6. Verify project name is updated in database
7. Verify response includes updated project

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ id: "project-uuid", name: "Renamed Project", owner_id: "user-uuid", ... }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['project-uuid', 'user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('UPDATE'),
  expect.arrayContaining(['Renamed Project', 'project-uuid', 'user-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  id: 'project-uuid',
  name: 'Renamed Project'
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Rename Project Without Authentication
**Test Name**: `should return error when rename is attempted without authentication`

**Description**: Verifies that project rename fails when user is not authenticated.

**Setup**:
- Mock request without authorization header

**Inputs**:
```typescript
Headers: {}
Params: { projectId: 'project-uuid' }
Body: { name: 'New Name' }
```

**Actions**:
1. Call rename endpoint without authentication
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

#### Test Case 3: Rename Project User Doesn't Own
**Test Name**: `should return error when user attempts to rename project they do not own`

**Description**: Verifies that project rename fails when user doesn't own the project.

**Setup**:
- Mock authentication middleware
- Mock database query to return project owned by different user

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'other-user-project-uuid' }
Body: { name: 'New Name' }
```

**Actions**:
1. Call rename endpoint for project owned by another user
2. Verify project ownership check fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 403 (Forbidden)
- Response body: `{ error: "Unauthorized" }` or `{ error: "You do not have permission to rename this project" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['other-user-project-uuid', 'user-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('UPDATE')
);
expect(reply.status).toHaveBeenCalledWith(403);
```

**Error Conditions**: User doesn't own project

---

#### Test Case 4: Rename Project with Empty Name
**Test Name**: `should return error when new project name is empty string`

**Description**: Verifies that project rename fails when new name is empty.

**Setup**:
- Mock authentication middleware
- Mock database connection pool

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { name: '' }
```

**Actions**:
1. Call rename endpoint with empty name
2. Verify validation detects empty name
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name cannot be empty" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith({ error: "Project name cannot be empty" });
```

**Error Conditions**: Empty name validation

---

#### Test Case 5: Rename Project with Null Name
**Test Name**: `should return error when new project name is null`

**Description**: Verifies that project rename fails when new name is null.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { name: null }
```

**Actions**:
1. Call rename endpoint with null name
2. Verify validation detects null name
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name is required" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('name')
}));
```

**Error Conditions**: Null name validation

---

#### Test Case 6: Rename Project with Duplicate Name
**Test Name**: `should return error when new name conflicts with existing project name`

**Description**: Verifies that project rename fails when new name already exists for another project owned by the user.

**Setup**:
- Mock authentication middleware
- Mock database query to return project owned by user
- Mock database query to check name uniqueness (returns existing project with same name)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { name: 'Existing Project Name' }
```

**Actions**:
1. Call rename endpoint with name that already exists
2. Verify name uniqueness check finds duplicate
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name already exists" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['Existing Project Name', 'user-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('UPDATE')
);
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith({ error: "Project name already exists" });
```

**Error Conditions**: Duplicate name

---

#### Test Case 7: Rename Project to Same Name
**Test Name**: `should successfully rename project when new name is same as current name`

**Description**: Verifies that renaming to the same name is allowed (idempotent operation).

**Setup**:
- Mock authentication middleware
- Mock database query to return project with current name
- Mock database UPDATE query

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { name: 'Current Project Name' }
```

**Actions**:
1. Call rename endpoint with same name as current name
2. Verify project is updated (or no-op if optimized)
3. Verify success response is returned

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body includes project with same name

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  name: 'Current Project Name'
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 8: Rename Non-Existent Project
**Test Name**: `should return error when project does not exist`

**Description**: Verifies that project rename fails when project ID doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result (project not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'non-existent-uuid' }
Body: { name: 'New Name' }
```

**Actions**:
1. Call rename endpoint with non-existent project ID
2. Verify project lookup returns no results
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 404 (Not Found)
- Response body: `{ error: "Project not found" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['non-existent-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('UPDATE')
);
expect(reply.status).toHaveBeenCalledWith(404);
expect(reply.send).toHaveBeenCalledWith({ error: "Project not found" });
```

**Error Conditions**: Project not found

---

#### Test Case 9: Rename Project with Maximum Length Name
**Test Name**: `should rename project when new name is at maximum length (255 characters)`

**Description**: Verifies that project rename succeeds with name at database maximum length.

**Setup**:
- Mock authentication middleware
- Mock database queries

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { name: 'A'.repeat(255) }
```

**Actions**:
1. Call rename endpoint with maximum length name
2. Verify project is renamed successfully

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body includes project with 255-character name

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  name: expect.stringMatching(/^.{255}$/)
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 10: Rename Project with Name Exceeding Maximum Length
**Test Name**: `should return error when new name exceeds maximum length (256+ characters)`

**Description**: Verifies that project rename fails when new name exceeds database maximum length.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { name: 'A'.repeat(256) }
```

**Actions**:
1. Call rename endpoint with name exceeding maximum length
2. Verify validation detects length violation
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project name cannot exceed 255 characters" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('255')
}));
```

**Error Conditions**: Name length exceeds maximum

---

#### Test Case 11: Rename Project with Database Error
**Test Name**: `should return error when database operation fails`

**Description**: Verifies that project rename handles database errors gracefully.

**Setup**:
- Mock authentication middleware
- Mock database query to throw error

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { name: 'New Name' }
```

**Actions**:
1. Call rename endpoint
2. Simulate database error
3. Verify error is caught and handled

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Rename failed" }` or generic error message

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
```

### Error Condition Summary
- Missing authentication
- User doesn't own project
- Empty name
- Null name
- Duplicate name
- Project not found
- Name exceeding maximum length (256+ characters)
- Database errors

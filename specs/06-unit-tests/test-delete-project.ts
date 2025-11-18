# Delete Project Unit Test Specification

## Test File: `delete-project.test.ts`

### Purpose
Test the delete project functionality, including successful deletion, authorization checks, and edge cases.

### Functions/APIs Being Tested
- `DELETE /api/projects/:projectId` endpoint
- Delete project service/function
- Project ownership verification
- Cascading deletion (functions, permissions, databases, instances)

### Test Cases

#### Test Case 1: Successful Project Deletion
**Test Name**: `should delete project and all associated data when user owns project`

**Description**: Verifies that a project owner can successfully delete their project and all associated data.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction (BEGIN, COMMIT)
- Mock database queries to:
  - Verify project ownership
  - Delete all functions in project
  - Delete all permissions for project
  - Delete all database instances
  - Delete all databases
  - Delete project record

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
1. Call delete project endpoint with valid project ID
2. Verify user is authenticated
3. Verify project exists and user owns it
4. Verify transaction is started
5. Verify all cascading deletions are performed:
   - Delete all functions in project
   - Delete all function bricks and connections
   - Delete all project permissions
   - Delete all database instances
   - Delete all databases
   - Delete project record
6. Verify transaction is committed
7. Verify success response is returned

**Expected Outputs**:
- HTTP status: 200 (OK) or 204 (No Content)
- Response body: `{ message: "Project deleted successfully" }` or empty body

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['project-uuid', 'user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith('BEGIN');
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM functions'),
  expect.arrayContaining(['project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM project_permissions'),
  expect.arrayContaining(['project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM database_instances'),
  expect.arrayContaining([expect.any(String)]) // database_id
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM databases'),
  expect.arrayContaining(['project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM projects'),
  expect.arrayContaining(['project-uuid', 'user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith('COMMIT');
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  message: expect.stringContaining('deleted')
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Delete Project Without Authentication
**Test Name**: `should return error when deletion is attempted without authentication`

**Description**: Verifies that project deletion fails when user is not authenticated.

**Setup**:
- Mock request without authorization header

**Inputs**:
```typescript
Headers: {}
Params: { projectId: 'project-uuid' }
```

**Actions**:
1. Call delete endpoint without authentication
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

#### Test Case 3: Delete Project User Doesn't Own
**Test Name**: `should return error when user attempts to delete project they do not own`

**Description**: Verifies that project deletion fails when user doesn't own the project.

**Setup**:
- Mock authentication middleware
- Mock database query to return project owned by different user

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'other-user-project-uuid' }
```

**Actions**:
1. Call delete endpoint for project owned by another user
2. Verify project ownership check fails
3. Verify error response is returned
4. Verify no deletion operations are performed

**Expected Outputs**:
- HTTP status: 403 (Forbidden)
- Response body: `{ error: "Unauthorized" }` or `{ error: "You do not have permission to delete this project" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['other-user-project-uuid', 'user-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('DELETE')
);
expect(reply.status).toHaveBeenCalledWith(403);
```

**Error Conditions**: User doesn't own project

---

#### Test Case 4: Delete Non-Existent Project
**Test Name**: `should return error when project does not exist`

**Description**: Verifies that project deletion fails when project ID doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result (project not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'non-existent-uuid' }
```

**Actions**:
1. Call delete endpoint with non-existent project ID
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
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(404);
expect(reply.send).toHaveBeenCalledWith({ error: "Project not found" });
```

**Error Conditions**: Project not found

---

#### Test Case 5: Delete Project with Database Transaction Error
**Test Name**: `should rollback transaction when database error occurs during deletion`

**Description**: Verifies that transaction is rolled back when an error occurs during cascading deletions.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction
- Mock database query to throw error during deletion

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
```

**Actions**:
1. Call delete endpoint
2. Simulate database error during cascading deletion
3. Verify transaction is rolled back
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Delete failed" }` or generic error message

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith('BEGIN');
expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
expect(mockQuery).not.toHaveBeenCalledWith('COMMIT');
expect(reply.status).toHaveBeenCalledWith(500);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Database transaction error

---

#### Test Case 6: Delete Project with Empty Project ID
**Test Name**: `should return error when project ID is empty string`

**Description**: Verifies that project deletion fails when project ID is empty.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: '' }
```

**Actions**:
1. Call delete endpoint with empty project ID
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

#### Test Case 7: Delete Project with Invalid Project ID Format
**Test Name**: `should return error when project ID is not a valid UUID`

**Description**: Verifies that project deletion fails when project ID is not a valid UUID format.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'invalid-uuid-format' }
```

**Actions**:
1. Call delete endpoint with invalid UUID format
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

#### Test Case 8: Delete Project with Null Project ID
**Test Name**: `should return error when project ID is null`

**Description**: Verifies that project deletion fails when project ID is null.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: null }
```

**Actions**:
1. Call delete endpoint with null project ID
2. Verify validation detects null ID
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Project ID is required" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Null project ID

---

### Mock Setup Requirements

```typescript
// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token) => ({ userId: 'user-uuid', email: 'user@example.com' })),
}));

// Mock PostgreSQL with transaction support
const mockQuery = jest.fn();
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockQuery,
    connect: jest.fn(() => Promise.resolve(mockClient)),
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
- Project not found
- Empty project ID
- Null project ID
- Invalid UUID format
- Database transaction errors

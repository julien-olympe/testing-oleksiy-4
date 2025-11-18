# Delete Brick Unit Test Specification

## Test File: `delete-brick.test.ts`

### Purpose
Test the delete brick functionality, including successful deletion, authorization checks, and cascading connection deletions.

### Functions/APIs Being Tested
- `DELETE /api/projects/:projectId/functions/:id/bricks/:brickId` endpoint
- Delete brick service/function
- Project ownership verification
- Cascading deletion (brick connections)

### Test Cases

#### Test Case 1: Successful Brick Deletion
**Test Name**: `should delete brick and all associated connections when user owns project`

**Description**: Verifies that a project owner can successfully delete a brick and all connections involving that brick.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction (BEGIN, COMMIT)
- Mock database queries to:
  - Verify project ownership
  - Verify function exists in project
  - Verify brick exists in function
  - Delete all connections involving the brick (as source or target)
  - Delete brick record

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
```

**Actions**:
1. Call delete brick endpoint with valid brick ID
2. Verify user is authenticated
3. Verify project exists and user owns it
4. Verify function exists in project
5. Verify brick exists in function
6. Verify transaction is started
7. Verify all cascading deletions are performed:
   - Delete all brick connections where brick is source (from_brick_id = brickId)
   - Delete all brick connections where brick is target (to_brick_id = brickId)
   - Delete brick record
8. Verify transaction is committed
9. Verify success response is returned

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ message: "Brick deleted successfully" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['project-uuid', 'user-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['function-uuid', 'project-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['brick-uuid', 'function-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith('BEGIN');
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM brick_connections'),
  expect.arrayContaining([expect.any(String)]) // brickId
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM function_bricks'),
  expect.arrayContaining(['brick-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith('COMMIT');
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  message: expect.stringContaining('deleted')
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Delete Brick Without Authentication
**Test Name**: `should return error when deletion is attempted without authentication`

**Description**: Verifies that brick deletion fails when user is not authenticated.

**Setup**:
- Mock request without authorization header

**Inputs**:
```typescript
Headers: {}
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
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
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Unauthorized')
}));
```

**Error Conditions**: Missing authentication

---

#### Test Case 3: Delete Brick User Doesn't Own Project
**Test Name**: `should return error when user attempts to delete brick from project they do not own`

**Description**: Verifies that brick deletion fails when user doesn't own the project.

**Setup**:
- Mock authentication middleware
- Mock database query to return project owned by different user

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'other-user-project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
```

**Actions**:
1. Call delete endpoint for brick in project owned by another user
2. Verify project ownership check fails
3. Verify error response is returned
4. Verify no deletion operations are performed

**Expected Outputs**:
- HTTP status: 403 (Forbidden)
- Response body: `{ error: "Only project owner can delete bricks" }`

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
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Only project owner can delete bricks')
}));
```

**Error Conditions**: User doesn't own project

---

#### Test Case 4: Delete Non-Existent Brick
**Test Name**: `should return error when brick does not exist`

**Description**: Verifies that brick deletion fails when brick ID doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result (brick not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'non-existent-uuid'
}
```

**Actions**:
1. Call delete endpoint with non-existent brick ID
2. Verify brick lookup returns no results
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 404 (Not Found)
- Response body: `{ error: "Brick not found" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['non-existent-uuid', 'function-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(404);
expect(reply.send).toHaveBeenCalledWith({ error: "Brick not found" });
```

**Error Conditions**: Brick not found

---

#### Test Case 5: Delete Brick from Non-Existent Function
**Test Name**: `should return error when function does not exist`

**Description**: Verifies that brick deletion fails when function ID doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result (function not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'non-existent-function-uuid',
  brickId: 'brick-uuid'
}
```

**Actions**:
1. Call delete endpoint with non-existent function ID
2. Verify function lookup returns no results
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 404 (Not Found)
- Response body: `{ error: "Function not found" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['non-existent-function-uuid', 'project-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(404);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('not found')
}));
```

**Error Conditions**: Function not found

---

#### Test Case 6: Delete Brick with Database Transaction Error
**Test Name**: `should rollback transaction when database error occurs during deletion`

**Description**: Verifies that transaction is rolled back when an error occurs during brick deletion.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction
- Mock database query to throw error during deletion

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
```

**Actions**:
1. Call delete endpoint
2. Simulate database error during deletion
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

#### Test Case 7: Delete Brick with Invalid Brick ID Format
**Test Name**: `should return error when brick ID is not a valid UUID`

**Description**: Verifies that brick deletion fails when brick ID is not a valid UUID format.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'invalid-uuid-format'
}
```

**Actions**:
1. Call delete endpoint with invalid UUID format
2. Verify UUID validation fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid brick ID format" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Invalid UUID format

---

#### Test Case 8: Delete Brick with Cascading Connection Deletion
**Test Name**: `should delete all connections involving the brick when brick is deleted`

**Description**: Verifies that all connections where the brick is either source or target are deleted.

**Setup**:
- Mock authentication middleware
- Mock database queries to return brick with multiple connections
- Mock database DELETE queries for connections

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
```

**Actions**:
1. Call delete endpoint for brick with connections
2. Verify all connections with brick as source are deleted
3. Verify all connections with brick as target are deleted
4. Verify brick is deleted
5. Verify success response

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ message: "Brick deleted successfully" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM brick_connections'),
  expect.arrayContaining([expect.any(String)]) // brickId in WHERE clause
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM function_bricks'),
  expect.arrayContaining(['brick-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(200);
```

**Error Conditions**: None (positive test case)

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

const createMockFunction = (overrides = {}) => ({
  id: 'function-uuid',
  name: 'Test Function',
  project_id: 'project-uuid',
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createMockBrick = (overrides = {}) => ({
  id: 'brick-uuid',
  function_id: 'function-uuid',
  brick_type: 'ListInstancesByDBName',
  position_x: 100,
  position_y: 200,
  configuration: {},
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});
```

### Error Condition Summary
- Missing authentication
- User doesn't own project
- Brick not found
- Function not found
- Invalid UUID format
- Database transaction errors

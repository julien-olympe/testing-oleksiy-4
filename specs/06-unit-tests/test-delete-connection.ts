# Delete Connection Unit Test Specification

## Test File: `delete-connection.test.ts`

### Purpose
Test the delete connection functionality, including successful deletion, authorization checks, and edge cases.

### Functions/APIs Being Tested
- `DELETE /api/projects/:projectId/functions/:id/connections/:connectionId` endpoint
- Delete connection service/function
- Project ownership verification
- Connection existence verification

### Test Cases

#### Test Case 1: Successful Connection Deletion
**Test Name**: `should delete connection when user owns project`

**Description**: Verifies that a project owner can successfully delete a connection between bricks.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction (BEGIN, COMMIT)
- Mock database queries to:
  - Verify project ownership
  - Verify function exists in project
  - Verify connection exists and belongs to function's bricks
  - Delete connection record

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  connectionId: 'connection-uuid'
}
```

**Actions**:
1. Call delete connection endpoint with valid connection ID
2. Verify user is authenticated
3. Verify project exists and user owns it
4. Verify function exists in project
5. Verify connection exists and belongs to function's bricks
6. Verify transaction is started
7. Delete connection record
8. Verify transaction is committed
9. Verify success response is returned

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ message: "Connection deleted successfully" }`

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
  expect.arrayContaining(['connection-uuid']) // JOIN with function_bricks to verify function
);
expect(mockQuery).toHaveBeenCalledWith('BEGIN');
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM brick_connections'),
  expect.arrayContaining(['connection-uuid'])
);
expect(mockQuery).toHaveBeenCalledWith('COMMIT');
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  message: expect.stringContaining('deleted')
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Delete Connection Without Authentication
**Test Name**: `should return error when deletion is attempted without authentication`

**Description**: Verifies that connection deletion fails when user is not authenticated.

**Setup**:
- Mock request without authorization header

**Inputs**:
```typescript
Headers: {}
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  connectionId: 'connection-uuid'
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

#### Test Case 3: Delete Connection User Doesn't Own Project
**Test Name**: `should return error when user attempts to delete connection from project they do not own`

**Description**: Verifies that connection deletion fails when user doesn't own the project.

**Setup**:
- Mock authentication middleware
- Mock database query to return project owned by different user

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'other-user-project-uuid',
  id: 'function-uuid',
  connectionId: 'connection-uuid'
}
```

**Actions**:
1. Call delete endpoint for connection in project owned by another user
2. Verify project ownership check fails
3. Verify error response is returned
4. Verify no deletion operations are performed

**Expected Outputs**:
- HTTP status: 403 (Forbidden)
- Response body: `{ error: "Only project owner can delete connections" }`

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
  error: expect.stringContaining('Only project owner can delete connections')
}));
```

**Error Conditions**: User doesn't own project

---

#### Test Case 4: Delete Non-Existent Connection
**Test Name**: `should return error when connection does not exist`

**Description**: Verifies that connection deletion fails when connection ID doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result (connection not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  connectionId: 'non-existent-uuid'
}
```

**Actions**:
1. Call delete endpoint with non-existent connection ID
2. Verify connection lookup returns no results
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 404 (Not Found)
- Response body: `{ error: "Connection not found" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['non-existent-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(404);
expect(reply.send).toHaveBeenCalledWith({ error: "Connection not found" });
```

**Error Conditions**: Connection not found

---

#### Test Case 5: Delete Connection from Non-Existent Function
**Test Name**: `should return error when function does not exist`

**Description**: Verifies that connection deletion fails when function ID doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database query to return empty result (function not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'non-existent-function-uuid',
  connectionId: 'connection-uuid'
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

#### Test Case 6: Delete Connection with Database Transaction Error
**Test Name**: `should rollback transaction when database error occurs during deletion`

**Description**: Verifies that transaction is rolled back when an error occurs during connection deletion.

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
  connectionId: 'connection-uuid'
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

#### Test Case 7: Delete Connection with Invalid Connection ID Format
**Test Name**: `should return error when connection ID is not a valid UUID`

**Description**: Verifies that connection deletion fails when connection ID is not a valid UUID format.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  connectionId: 'invalid-uuid-format'
}
```

**Actions**:
1. Call delete endpoint with invalid UUID format
2. Verify UUID validation fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid connection ID format" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Invalid UUID format

---

#### Test Case 8: Delete Connection Belonging to Different Function
**Test Name**: `should return error when connection belongs to different function`

**Description**: Verifies that connection deletion fails when connection exists but belongs to a different function.

**Setup**:
- Mock authentication middleware
- Mock database query to return connection that belongs to different function

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  connectionId: 'connection-uuid'
}
```

**Actions**:
1. Call delete endpoint with connection ID that belongs to different function
2. Verify connection lookup shows it doesn't belong to specified function
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 404 (Not Found)
- Response body: `{ error: "Connection not found" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['connection-uuid', 'function-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(404);
expect(reply.send).toHaveBeenCalledWith({ error: "Connection not found" });
```

**Error Conditions**: Connection belongs to different function

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

const createMockConnection = (overrides = {}) => ({
  id: 'connection-uuid',
  from_brick_id: 'brick-1-uuid',
  from_output_name: 'List',
  to_brick_id: 'brick-2-uuid',
  to_input_name: 'List',
  created_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});
```

### Error Condition Summary
- Missing authentication
- User doesn't own project
- Connection not found
- Function not found
- Connection belongs to different function
- Invalid UUID format
- Database transaction errors

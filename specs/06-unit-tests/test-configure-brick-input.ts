# Update Brick Unit Test Specification

## Test File: `update-brick.test.ts`

### Purpose
Test the update brick functionality, including successful updates of brick configuration and position, validation errors, and edge cases.

### Functions/APIs Being Tested
- `PUT /api/projects/:projectId/functions/:id/bricks/:brickId` endpoint
- Update brick service/function
- Project ownership verification
- Brick type validation
- Position coordinate validation
- Configuration validation (for ListInstancesByDBName brick)
- Database name validation (for ListInstancesByDBName brick)

### Test Cases

#### Test Case 1: Successful Update Brick Configuration
**Test Name**: `should update brick configuration when user owns project and provides valid configuration`

**Description**: Verifies that a project owner can successfully update a brick's configuration.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction (BEGIN, COMMIT)
- Mock database queries to:
  - Verify project ownership
  - Verify function exists in project
  - Verify brick exists in function
  - Verify database exists (for ListInstancesByDBName brick)
  - Update brick configuration

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
Body: {
  configuration: {
    "Name of DB": "default database"
  }
}
```

**Actions**:
1. Call update brick endpoint with valid configuration
2. Verify user is authenticated
3. Verify project exists and user owns it
4. Verify function exists in project
5. Verify brick exists in function
6. Verify configuration matches expected format for brick type
7. Verify database exists (for ListInstancesByDBName brick)
8. Verify transaction is started
9. Update brick configuration in database
10. Verify transaction is committed
11. Verify success response is returned with updated brick

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ brick: { id: "brick-uuid", brickType: "ListInstancesByDBName", configuration: { "Name of DB": "default database" }, ... } }`

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
  expect.stringContaining('UPDATE function_bricks'),
  expect.arrayContaining([
    expect.objectContaining({ "Name of DB": "default database" }),
    'brick-uuid'
  ])
);
expect(mockQuery).toHaveBeenCalledWith('COMMIT');
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  brick: expect.objectContaining({
    id: 'brick-uuid',
    configuration: expect.objectContaining({
      "Name of DB": "default database"
    })
  })
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Successful Update Brick Position
**Test Name**: `should update brick position when user owns project and provides valid coordinates`

**Description**: Verifies that a project owner can successfully update a brick's position.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction (BEGIN, COMMIT)
- Mock database queries to:
  - Verify project ownership
  - Verify function exists in project
  - Verify brick exists in function
  - Update brick position

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
Body: {
  positionX: 150,
  positionY: 250
}
```

**Actions**:
1. Call update brick endpoint with valid position coordinates
2. Verify user is authenticated
3. Verify project exists and user owns it
4. Verify function exists in project
5. Verify brick exists in function
6. Verify position coordinates are non-negative integers
7. Verify transaction is started
8. Update brick position in database
9. Verify transaction is committed
10. Verify success response is returned with updated brick

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ brick: { id: "brick-uuid", positionX: 150, positionY: 250, ... } }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith('BEGIN');
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('UPDATE function_bricks'),
  expect.arrayContaining([
    150, // positionX
    250, // positionY
    'brick-uuid'
  ])
);
expect(mockQuery).toHaveBeenCalledWith('COMMIT');
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  brick: expect.objectContaining({
    id: 'brick-uuid',
    positionX: 150,
    positionY: 250
  })
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 3: Successful Update Brick Position and Configuration
**Test Name**: `should update both brick position and configuration when user owns project`

**Description**: Verifies that a project owner can successfully update both position and configuration in a single request.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction (BEGIN, COMMIT)
- Mock database queries to:
  - Verify project ownership
  - Verify function exists in project
  - Verify brick exists in function
  - Verify configuration matches expected format
  - Update brick position and configuration

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
Body: {
  positionX: 200,
  positionY: 300,
  configuration: {
    "Name of DB": "default database"
  }
}
```

**Actions**:
1. Call update brick endpoint with both position and configuration
2. Verify all validations pass
3. Update brick position and configuration in database
4. Verify success response is returned

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ brick: { id: "brick-uuid", positionX: 200, positionY: 300, configuration: { "Name of DB": "default database" }, ... } }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith('BEGIN');
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('UPDATE function_bricks'),
  expect.arrayContaining([
    200, // positionX
    300, // positionY
    expect.objectContaining({ "Name of DB": "default database" }),
    'brick-uuid'
  ])
);
expect(mockQuery).toHaveBeenCalledWith('COMMIT');
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  brick: expect.objectContaining({
    positionX: 200,
    positionY: 300,
    configuration: expect.objectContaining({
      "Name of DB": "default database"
    })
  })
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 4: Update Brick Without Authentication
**Test Name**: `should return error when update is attempted without authentication`

**Description**: Verifies that brick update fails when user is not authenticated.

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
Body: {
  configuration: { "Name of DB": "default database" }
}
```

**Actions**:
1. Call update endpoint without authentication
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

#### Test Case 5: Update Brick User Doesn't Own Project
**Test Name**: `should return error when user attempts to update brick from project they do not own`

**Description**: Verifies that brick update fails when user doesn't own the project.

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
Body: {
  configuration: { "Name of DB": "default database" }
}
```

**Actions**:
1. Call update endpoint for brick in project owned by another user
2. Verify project ownership check fails
3. Verify error response is returned
4. Verify no update operations are performed

**Expected Outputs**:
- HTTP status: 403 (Forbidden)
- Response body: `{ error: "Only project owner can update bricks" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['other-user-project-uuid', 'user-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(mockQuery).not.toHaveBeenCalledWith(
  expect.stringContaining('UPDATE')
);
expect(reply.status).toHaveBeenCalledWith(403);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Only project owner can update bricks')
}));
```

**Error Conditions**: User doesn't own project

---

#### Test Case 6: Update Non-Existent Brick
**Test Name**: `should return error when brick does not exist`

**Description**: Verifies that brick update fails when brick ID doesn't exist.

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
Body: {
  configuration: { "Name of DB": "default database" }
}
```

**Actions**:
1. Call update endpoint with non-existent brick ID
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

#### Test Case 7: Update Brick with Invalid Position Coordinates (Negative)
**Test Name**: `should return error when position coordinates are negative`

**Description**: Verifies that brick update fails when position coordinates are negative.

**Setup**:
- Mock authentication middleware
- Mock database queries for project, function, and brick

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
Body: {
  positionX: -10,
  positionY: 200
}
```

**Actions**:
1. Call update endpoint with negative position coordinates
2. Verify position validation fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid position coordinates" }`

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Invalid position coordinates')
}));
```

**Error Conditions**: Invalid position coordinates

---

#### Test Case 8: Update Brick Configuration with Non-Existent Database
**Test Name**: `should return error when configuration references non-existent database`

**Description**: Verifies that brick update fails when configuration references a database that doesn't exist.

**Setup**:
- Mock authentication middleware
- Mock database queries for project, function, and brick
- Mock database query to return empty result (database not found)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
Body: {
  configuration: {
    "Name of DB": "non-existent-database"
  }
}
```

**Actions**:
1. Call update endpoint with configuration referencing non-existent database
2. Verify database lookup returns no results
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid configuration" }` or `{ error: "Database not found" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['non-existent-database', 'project-uuid'])
);
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Database not found

---

#### Test Case 9: Update Brick with Invalid Configuration Format
**Test Name**: `should return error when configuration does not match expected format for brick type`

**Description**: Verifies that brick update fails when configuration format is invalid for the brick type.

**Setup**:
- Mock authentication middleware
- Mock database queries for project, function, and brick

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
Body: {
  configuration: {
    "InvalidField": "value"
  }
}
```

**Actions**:
1. Call update endpoint with invalid configuration format
2. Verify configuration validation fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid configuration" }`

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalledWith('BEGIN');
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Invalid configuration')
}));
```

**Error Conditions**: Invalid configuration format

---

#### Test Case 10: Update Brick with Database Transaction Error
**Test Name**: `should rollback transaction when database error occurs during update`

**Description**: Verifies that transaction is rolled back when an error occurs during brick update.

**Setup**:
- Mock authentication middleware
- Mock database connection pool
- Mock database transaction
- Mock database query to throw error during update

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
Body: {
  configuration: { "Name of DB": "default database" }
}
```

**Actions**:
1. Call update endpoint
2. Simulate database error during update
3. Verify transaction is rolled back
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Update failed" }` or generic error message

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

#### Test Case 11: Update Brick with Empty Request Body
**Test Name**: `should return error when request body is empty`

**Description**: Verifies that brick update fails when no update fields are provided.

**Setup**:
- Mock authentication middleware

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: {
  projectId: 'project-uuid',
  id: 'function-uuid',
  brickId: 'brick-uuid'
}
Body: {}
```

**Actions**:
1. Call update endpoint with empty request body
2. Verify validation detects no update fields
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "At least one field (positionX, positionY, or configuration) must be provided" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Empty request body

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
- User doesn't own project
- Brick not found
- Invalid position coordinates (negative values)
- Invalid configuration format
- Database not found (for ListInstancesByDBName brick)
- Empty request body
- Database transaction errors

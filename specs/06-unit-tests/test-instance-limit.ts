# Database Instance Limit Unit Test Specification

## Test File: `instance-limit.test.ts`

### Purpose
Test the database instance limit functionality, verifying that databases cannot exceed the maximum of 10000 instances per database.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/databases/:databaseId/instances` endpoint (create instance)
- Instance limit enforcement
- Instance count verification
- Instance creation performance

### Test Cases

#### Test Case 1: Create Instance at Limit Boundary
**Test Name**: `should successfully create instance when database has exactly 9999 instances`

**Description**: Verifies that instance creation succeeds when database is one instance below the limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count instances (returns 9999)
- Mock database INSERT for instance

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', databaseId: 'database-uuid' }
Body: {
  data_values: { string_prop: "Test Value" }
}
```

**Actions**:
1. Count database's instances (returns 9999)
2. Verify count < 10000
3. Create instance
4. Verify instance is created successfully

**Expected Outputs**:
- HTTP status: 201 (Created)
- Instance created successfully

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT'),
  expect.arrayContaining(['database-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Create Instance at Maximum Limit
**Test Name**: `should return error when database has reached maximum instance limit (10000 instances)`

**Description**: Verifies that instance creation fails when database has reached the maximum limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count instances (returns 10000)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', databaseId: 'database-uuid' }
Body: {
  data_values: { string_prop: "Test Value" }
}
```

**Actions**:
1. Count database's instances (returns 10000)
2. Verify count >= 10000
3. Reject instance creation
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum instance limit reached (10000 instances)" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('10000')
}));
```

**Error Conditions**: Instance limit reached

---

#### Test Case 3: Create Instance Exceeding Limit
**Test Name**: `should return error when database has more than 10000 instances`

**Description**: Verifies that instance creation fails when database exceeds the limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count instances (returns 10001)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', databaseId: 'database-uuid' }
Body: {
  data_values: { string_prop: "Test Value" }
}
```

**Actions**:
1. Count database's instances (returns 10001)
2. Verify count > 10000
3. Reject instance creation
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum instance limit reached (10000 instances)" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
```

**Error Conditions**: Instance limit exceeded

---

#### Test Case 4: Instance Creation Performance
**Test Name**: `should create instance within 200ms regardless of total instance count`

**Description**: Verifies that instance creation completes within performance requirement even with maximum instances.

**Setup**:
- Mock authentication middleware
- Mock database queries (simulate 9999 existing instances)
- Measure creation time

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', databaseId: 'database-uuid' }
Body: {
  data_values: { string_prop: "Test Value" }
}
```

**Actions**:
1. Count instances (returns 9999)
2. Create new instance
3. Measure execution time
4. Verify time < 200ms

**Expected Outputs**:
- Instance created successfully
- Execution time < 200ms

**Assertions**:
```typescript
const startTime = Date.now();
// Execute instance creation
const endTime = Date.now();
const executionTime = endTime - startTime;
expect(executionTime).toBeLessThan(200);
```

**Error Conditions**: Performance timeout (> 200ms)

---

#### Test Case 5: Instance Query Pagination
**Test Name**: `should support pagination when querying instances (default 100 per page)`

**Description**: Verifies that instance queries support pagination for large datasets.

**Setup**:
- Mock authentication middleware
- Mock database query with LIMIT and OFFSET

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', databaseId: 'database-uuid' }
Query: { page: 1, limit: 100 }
```

**Actions**:
1. Query instances with pagination
2. Verify LIMIT and OFFSET are applied
3. Return paginated results

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response includes pagination metadata
- Response includes up to 100 instances

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('LIMIT'),
  expect.arrayContaining([100, 0]) // limit, offset
);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  instances: expect.any(Array),
  pagination: expect.objectContaining({
    page: 1,
    limit: 100
  })
}));
```

**Error Conditions**: None (positive test case)

---

### Performance Requirements
- Maximum instances per database: 10000
- Instance queries must support pagination (default 100 instances per page)
- Instance creation must complete within 200ms regardless of total instance count

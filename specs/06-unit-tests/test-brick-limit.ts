# Brick Limit Unit Test Specification

## Test File: `brick-limit.test.ts`

### Purpose
Test the brick limit functionality, verifying that functions cannot exceed the maximum of 100 bricks per function.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/functions/:functionId/bricks` endpoint (add brick)
- Brick limit enforcement
- Brick count verification
- Connection graph validation performance

### Test Cases

#### Test Case 1: Add Brick at Limit Boundary
**Test Name**: `should successfully add brick when function has exactly 99 bricks`

**Description**: Verifies that brick addition succeeds when function is one brick below the limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count bricks (returns 99)
- Mock database INSERT for brick

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
Body: {
  brick_type: 'ListInstancesByDBName',
  position_x: 100,
  position_y: 200,
  configuration: {}
}
```

**Actions**:
1. Count function's bricks (returns 99)
2. Verify count < 100
3. Add brick
4. Verify brick is added successfully

**Expected Outputs**:
- HTTP status: 201 (Created)
- Brick added successfully

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT'),
  expect.arrayContaining(['function-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Add Brick at Maximum Limit
**Test Name**: `should return error when function has reached maximum brick limit (100 bricks)`

**Description**: Verifies that brick addition fails when function has reached the maximum limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count bricks (returns 100)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
Body: {
  brick_type: 'ListInstancesByDBName',
  position_x: 100,
  position_y: 200,
  configuration: {}
}
```

**Actions**:
1. Count function's bricks (returns 100)
2. Verify count >= 100
3. Reject brick addition
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum brick limit reached (100 bricks)" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('100')
}));
```

**Error Conditions**: Brick limit reached

---

#### Test Case 3: Add Brick Exceeding Limit
**Test Name**: `should return error when function has more than 100 bricks`

**Description**: Verifies that brick addition fails when function exceeds the limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count bricks (returns 101)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
Body: {
  brick_type: 'ListInstancesByDBName',
  position_x: 100,
  position_y: 200,
  configuration: {}
}
```

**Actions**:
1. Count function's bricks (returns 101)
2. Verify count > 100
3. Reject brick addition
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum brick limit reached (100 bricks)" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
```

**Error Conditions**: Brick limit exceeded

---

#### Test Case 4: Connection Graph Validation Performance
**Test Name**: `should validate brick connection graph within 1 second for function with 100 bricks`

**Description**: Verifies that connection graph validation completes within performance requirement.

**Setup**:
- Mock authentication middleware
- Mock database queries for 100 bricks and their connections
- Measure validation time

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
```

**Actions**:
1. Load function with 100 bricks
2. Load all brick connections
3. Validate connection graph (check for cycles, type matching)
4. Measure execution time
5. Verify time < 1000ms

**Expected Outputs**:
- Validation completes successfully
- Execution time < 1000ms

**Assertions**:
```typescript
const startTime = Date.now();
// Execute validation
const endTime = Date.now();
const executionTime = endTime - startTime;
expect(executionTime).toBeLessThan(1000);
```

**Error Conditions**: Validation timeout (> 1 second)

---

### Performance Requirements
- Maximum bricks per function: 100
- Brick connection graph validation must complete within 1 second for functions with maximum brick count

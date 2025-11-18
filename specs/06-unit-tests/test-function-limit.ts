# Function Limit Unit Test Specification

## Test File: `function-limit.test.ts`

### Purpose
Test the function limit functionality, verifying that projects cannot exceed the maximum of 500 functions per project.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/functions` endpoint (create function)
- Function limit enforcement
- Function count verification

### Test Cases

#### Test Case 1: Create Function at Limit Boundary
**Test Name**: `should successfully create function when project has exactly 499 functions`

**Description**: Verifies that function creation succeeds when project is one function below the limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count functions (returns 499)
- Mock database INSERT for function

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: {}
```

**Actions**:
1. Count project's functions (returns 499)
2. Verify count < 500
3. Create function
4. Verify function is created successfully

**Expected Outputs**:
- HTTP status: 201 (Created)
- Function created successfully

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT COUNT'),
  expect.arrayContaining(['project-uuid'])
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Create Function at Maximum Limit
**Test Name**: `should return error when project has reached maximum function limit (500 functions)`

**Description**: Verifies that function creation fails when project has reached the maximum limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count functions (returns 500)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: {}
```

**Actions**:
1. Count project's functions (returns 500)
2. Verify count >= 500
3. Reject function creation
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum function limit reached (500 functions)" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('500')
}));
```

**Error Conditions**: Function limit reached

---

#### Test Case 3: Create Function Exceeding Limit
**Test Name**: `should return error when project has more than 500 functions`

**Description**: Verifies that function creation fails when project exceeds the limit.

**Setup**:
- Mock authentication middleware
- Mock database query to count functions (returns 501)

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: {}
```

**Actions**:
1. Count project's functions (returns 501)
2. Verify count > 500
3. Reject function creation
4. Return error response

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Maximum function limit reached (500 functions)" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
```

**Error Conditions**: Function limit exceeded

---

### Performance Requirements
- Maximum functions per project: 500
- Function list queries must paginate when exceeding 50 functions per page
- Limit check must complete within 200ms

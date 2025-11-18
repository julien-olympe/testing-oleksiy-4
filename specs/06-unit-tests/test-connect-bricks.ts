# Connect Bricks Unit Test Specification

## Test File: `connect-bricks.test.ts`

### Purpose
Test the connect bricks functionality, including successful connection, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/functions/:functionId/connections` endpoint
- Connect bricks service/function
- Project access verification
- Brick existence verification
- Output/input type matching
- Circular dependency detection
- Single input connection constraint

### Test Cases

#### Test Case 1: Successful Connect Bricks
**Test Name**: `should create connection between bricks when output and input types match`

**Description**: Verifies that users can connect compatible brick outputs to inputs.

**Setup**:
- Mock authentication middleware
- Mock database queries for bricks and their types
- Mock database INSERT for connection

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
Body: {
  from_brick_id: 'brick-1-uuid',
  from_output_name: 'List',
  to_brick_id: 'brick-2-uuid',
  to_input_name: 'List'
}
```

**Actions**:
1. Verify project access
2. Verify both bricks exist in function
3. Verify output type matches input type
4. Verify no circular dependency
5. Verify input doesn't already have connection
6. Create connection record
7. Return created connection

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body: `{ id: "connection-uuid", from_brick_id: "...", to_brick_id: "...", ... }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO brick_connections'),
  expect.arrayContaining([
    'brick-1-uuid',
    'List',
    'brick-2-uuid',
    'List'
  ])
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: Missing auth, no project access, brick not found, type mismatch, circular dependency, input already connected, database errors

---

#### Test Case 2: Connect Bricks with Type Mismatch
**Test Name**: `should return error when output type does not match input type`

**Expected Outputs**: HTTP 400, `{ error: "Output type does not match input type" }`

#### Test Case 3: Connect Bricks Creating Circular Dependency
**Test Name**: `should return error when connection creates circular dependency`

**Expected Outputs**: HTTP 400, `{ error: "Circular connection not allowed" }`

#### Test Case 4: Connect to Already Connected Input
**Test Name**: `should return error when input already has a connection`

**Expected Outputs**: HTTP 400, `{ error: "Input already has a connection" }`

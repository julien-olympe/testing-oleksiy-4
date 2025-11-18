# Add Brick to Function Unit Test Specification

## Test File: `add-brick.test.ts`

### Purpose
Test the add brick to function functionality, including successful addition, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/functions/:functionId/bricks` endpoint
- Add brick service/function
- Project access verification
- Brick type validation
- Grid position validation
- Brick limit verification (100 bricks per function)

### Test Cases

#### Test Case 1: Successful Add Brick
**Test Name**: `should add brick to function when user has project access and provides valid brick data`

**Description**: Verifies that users with project access can add bricks to functions.

**Setup**:
- Mock authentication middleware
- Mock database queries for project access and function
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
1. Verify project access
2. Verify function exists in project
3. Validate brick type (ListInstancesByDBName, GetFirstInstance, LogInstanceProps)
4. Validate grid position
5. Create brick record
6. Return created brick

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body: `{ id: "brick-uuid", function_id: "function-uuid", brick_type: "ListInstancesByDBName", position_x: 100, position_y: 200, ... }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO function_bricks'),
  expect.arrayContaining([
    'function-uuid',
    'ListInstancesByDBName',
    100,
    200,
    expect.any(Object) // configuration
  ])
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: Missing auth, no project access, function not found, invalid brick type, invalid position, brick limit reached, database errors

---

#### Test Case 2: Add Brick When Limit Reached
**Test Name**: `should return error when function has reached maximum brick limit (100 bricks)`

**Expected Outputs**: HTTP 400, `{ error: "Maximum brick limit reached (100 bricks)" }`

#### Test Case 3: Add Brick with Invalid Brick Type
**Test Name**: `should return error when brick type is invalid`

**Expected Outputs**: HTTP 400, `{ error: "Invalid brick type" }`

#### Test Case 4: Add Brick with Negative Position
**Test Name**: `should return error when position coordinates are negative`

**Expected Outputs**: HTTP 400, `{ error: "Position coordinates must be non-negative" }`

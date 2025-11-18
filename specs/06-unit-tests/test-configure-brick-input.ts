# Configure Brick Input Unit Test Specification

## Test File: `configure-brick-input.test.ts`

### Purpose
Test the configure brick input functionality, including successful configuration, validation errors, and edge cases.

### Functions/APIs Being Tested
- `PUT /api/projects/:projectId/functions/:functionId/bricks/:brickId/configuration` endpoint
- Configure brick input service/function
- Project access verification
- Brick type validation
- Database name validation (for ListInstancesByDBName brick)

### Test Cases

#### Test Case 1: Successful Configure Brick Input
**Test Name**: `should configure brick input when user provides valid database name for ListInstancesByDBName brick`

**Description**: Verifies that users can configure brick inputs (e.g., database name selection).

**Setup**:
- Mock authentication middleware
- Mock database queries for brick and available databases
- Mock database UPDATE for brick configuration

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid', brickId: 'brick-uuid' }
Body: {
  input_name: 'Name of DB',
  value: 'default database'
}
```

**Actions**:
1. Verify project access
2. Verify brick exists in function
3. Verify brick type supports configuration (ListInstancesByDBName)
4. Verify database exists in project
5. Update brick configuration
6. Return updated brick

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ id: "brick-uuid", configuration: { "Name of DB": "default database" }, ... }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('UPDATE function_bricks'),
  expect.arrayContaining([
    expect.objectContaining({ 'Name of DB': 'default database' }),
    'brick-uuid'
  ])
);
expect(reply.status).toHaveBeenCalledWith(200);
```

**Error Conditions**: Missing auth, no project access, brick not found, invalid input name, database not found, database errors

---

#### Test Case 2: Configure Brick Input with Non-Existent Database
**Test Name**: `should return error when selected database does not exist`

**Expected Outputs**: HTTP 400, `{ error: "Database not found" }`

#### Test Case 3: Configure Brick Input with Invalid Input Name
**Test Name**: `should return error when input name is invalid for brick type`

**Expected Outputs**: HTTP 400, `{ error: "Invalid input name for brick type" }`

#### Test Case 4: Configure Non-Configurable Brick
**Test Name**: `should return error when brick type does not support configuration`

**Expected Outputs**: HTTP 400, `{ error: "Brick type does not support configuration" }`

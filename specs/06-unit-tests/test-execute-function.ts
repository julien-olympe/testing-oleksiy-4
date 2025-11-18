# Execute Function Unit Test Specification

## Test File: `execute-function.test.ts`

### Purpose
Test the execute function functionality, including successful execution, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/functions/:functionId/execute` endpoint
- Execute function service/function
- Project access verification
- Brick connection validation
- Brick configuration validation
- Function execution logic
- Console output generation

### Test Cases

#### Test Case 1: Successful Execute Function
**Test Name**: `should execute function and return console output when all bricks are properly connected and configured`

**Description**: Verifies that a properly configured function executes successfully.

**Setup**:
- Mock authentication middleware
- Mock database queries for function, bricks, connections
- Mock brick execution logic
- Mock database queries for database instances

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
Body: {}
```

**Actions**:
1. Verify project access
2. Load function, bricks, and connections
3. Validate all required inputs are connected
4. Validate all required inputs are configured
5. Execute brick logic in order (topological sort)
6. Collect console output
7. Return execution results

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ success: true, console_output: ["Log instance props: {...}", ...] }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  success: true,
  console_output: expect.arrayContaining([
    expect.stringContaining('Log instance props')
  ])
}));
```

**Error Conditions**: Missing auth, no project access, incomplete connections, unconfigured inputs, execution errors, database errors

---

#### Test Case 2: Execute Function with Incomplete Connections
**Test Name**: `should return error when required brick inputs are not connected`

**Expected Outputs**: HTTP 400, `{ error: "Brick connections incomplete" }`

#### Test Case 3: Execute Function with Unconfigured Input
**Test Name**: `should return error when required brick input is not configured`

**Expected Outputs**: HTTP 400, `{ error: "Brick input not configured" }`

#### Test Case 4: Execute Function with Execution Error
**Test Name**: `should return error when brick execution fails`

**Expected Outputs**: HTTP 500, `{ error: "Execution failed" }`

#### Test Case 5: Execute Empty Function
**Test Name**: `should return error when function has no bricks`

**Expected Outputs**: HTTP 400, `{ error: "Function has no bricks" }`

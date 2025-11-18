# View Console Output Unit Test Specification

## Test File: `view-console-output.test.ts`

### Purpose
Test the view console output functionality, including successful retrieval of execution results.

### Functions/APIs Being Tested
- `GET /api/projects/:projectId/functions/:functionId/console` endpoint (if implemented)
- View console output service/function
- Project access verification
- Console output retrieval

### Test Cases

#### Test Case 1: Successful View Console Output
**Test Name**: `should return console output from function execution when user has project access`

**Description**: Verifies that users can view console output from function executions.

**Setup**:
- Mock authentication middleware
- Mock database queries for console output

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
```

**Actions**:
1. Verify project access
2. Load console output for function
3. Return console output

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ console_output: ["Log instance props: {...}", ...] }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  console_output: expect.arrayContaining([
    expect.any(String)
  ])
}));
```

**Error Conditions**: Missing auth, no project access, function not found, database errors

---

#### Test Case 2: View Console Output Without Project Access
**Test Name**: `should return error when user lacks project access`

**Expected Outputs**: HTTP 403, `{ error: "Access denied" }`

#### Test Case 3: View Console Output for Non-Existent Function
**Test Name**: `should return error when function does not exist`

**Expected Outputs**: HTTP 404, `{ error: "Function not found" }`

### Notes
- Console output may be stored in database or generated on-demand
- Console output format: `[Function: <function_name>] <log_message>`
- Console output includes property values from LogInstanceProps brick

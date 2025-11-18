# Open Function Editor Unit Test Specification

## Test File: `open-function-editor.test.ts`

### Purpose
Test the open function editor functionality, including successful opening, permission checks, and loading function data.

### Functions/APIs Being Tested
- `GET /api/projects/:projectId/functions/:functionId` endpoint
- Open function editor service/function
- Project access verification
- Loading function data, bricks, and connections

### Test Cases

#### Test Case 1: Successful Open Function Editor
**Test Name**: `should return function data with bricks and connections when user has project access`

**Description**: Verifies that function editor loads all function data including bricks and connections.

**Setup**:
- Mock authentication middleware
- Mock database queries for function, bricks, and connections

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
```

**Actions**:
1. Verify project access
2. Verify function exists in project
3. Load function data
4. Load function bricks
5. Load brick connections
6. Return complete function data

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ function: {...}, bricks: [...], connections: [...] }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  function: expect.objectContaining({ id: 'function-uuid' }),
  bricks: expect.any(Array),
  connections: expect.any(Array)
}));
```

**Error Conditions**: Missing auth, no project access, function not found, database errors

---

#### Test Case 2: Open Function Editor Without Project Access
**Test Name**: `should return error when user lacks project access`

**Expected Outputs**: HTTP 403, `{ error: "Access denied" }`

#### Test Case 3: Open Non-Existent Function
**Test Name**: `should return error when function does not exist`

**Expected Outputs**: HTTP 404, `{ error: "Function not found" }`

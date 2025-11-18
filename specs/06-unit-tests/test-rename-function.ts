# Rename Function Unit Test Specification

## Test File: `rename-function.test.ts`

### Purpose
Test the rename function functionality, including successful renaming, validation errors, and edge cases.

### Functions/APIs Being Tested
- `PUT /api/projects/:projectId/functions/:functionId` endpoint
- Rename function service/function
- Project access verification
- Function name uniqueness validation (within project)

### Test Cases

#### Test Case 1: Successful Function Rename
**Test Name**: `should rename function when user has project access and provides valid new name`

**Description**: Verifies that a user with project access can successfully rename a function.

**Setup**:
- Mock authentication middleware
- Mock database queries to verify project access and function existence
- Mock database UPDATE query

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
Body: { name: 'Renamed Function' }
```

**Actions**:
1. Verify project access
2. Verify function exists in project
3. Verify new name doesn't conflict with existing function names in project
4. Update function name in database
5. Return updated function

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ id: "function-uuid", name: "Renamed Function", project_id: "project-uuid", ... }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  name: 'Renamed Function'
}));
```

**Error Conditions**: Missing auth, no project access, function not found, empty name, duplicate name, database errors

---

#### Test Case 2: Rename Function Without Project Access
**Test Name**: `should return error when user lacks project access`

**Expected Outputs**: HTTP 403, `{ error: "Access denied" }`

#### Test Case 3: Rename Function with Empty Name
**Test Name**: `should return error when new name is empty string`

**Expected Outputs**: HTTP 400, `{ error: "Function name cannot be empty" }`

#### Test Case 4: Rename Function with Duplicate Name
**Test Name**: `should return error when new name conflicts with existing function name`

**Expected Outputs**: HTTP 400, `{ error: "Function name already exists" }`

#### Test Case 5: Rename Non-Existent Function
**Test Name**: `should return error when function does not exist`

**Expected Outputs**: HTTP 404, `{ error: "Function not found" }`

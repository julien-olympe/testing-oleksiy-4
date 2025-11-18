# Delete Function Unit Test Specification

## Test File: `delete-function.test.ts`

### Purpose
Test the delete function functionality, including successful deletion, authorization checks, and cascading deletions.

### Functions/APIs Being Tested
- `DELETE /api/projects/:projectId/functions/:functionId` endpoint
- Delete function service/function
- Project access verification
- Cascading deletion (function bricks, connections)

### Test Cases

#### Test Case 1: Successful Function Deletion
**Test Name**: `should delete function and all associated bricks and connections when user has project access`

**Description**: Verifies cascading deletion of function, bricks, and connections.

**Setup**:
- Mock authentication middleware
- Mock database transaction
- Mock cascading DELETE queries

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', functionId: 'function-uuid' }
```

**Actions**:
1. Verify project access
2. Verify function exists in project
3. Start transaction
4. Delete all brick connections
5. Delete all function bricks
6. Delete function
7. Commit transaction

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ message: "Function deleted successfully" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith('BEGIN');
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM brick_connections')
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM function_bricks')
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('DELETE FROM functions')
);
expect(mockQuery).toHaveBeenCalledWith('COMMIT');
```

**Error Conditions**: Missing auth, no project access, function not found, database errors

---

#### Test Case 2: Delete Function Without Project Access
**Test Name**: `should return error when user lacks project access`

**Expected Outputs**: HTTP 403, `{ error: "Access denied" }`

#### Test Case 3: Delete Non-Existent Function
**Test Name**: `should return error when function does not exist`

**Expected Outputs**: HTTP 404, `{ error: "Function not found" }`

#### Test Case 4: Delete Function with Transaction Error
**Test Name**: `should rollback transaction when database error occurs`

**Expected Outputs**: HTTP 500, transaction rolled back

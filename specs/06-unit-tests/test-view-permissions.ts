# View Permissions Unit Test Specification

## Test File: `view-permissions.test.ts`

### Purpose
Test the view permissions functionality, including successful retrieval of users with project access.

### Functions/APIs Being Tested
- `GET /api/projects/:projectId/permissions` endpoint
- View permissions service/function
- Project access verification
- Loading project owner and users with permissions

### Test Cases

#### Test Case 1: Successful View Permissions
**Test Name**: `should return list of users with project access when user has project access`

**Description**: Verifies that users with project access can view the permissions list.

**Setup**:
- Mock authentication middleware
- Mock database queries for project owner and permissions

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
```

**Actions**:
1. Verify project access
2. Load project owner information
3. Load users with ProjectPermission entries
4. Return combined list

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ users: [{ id: "...", email: "...", isOwner: true/false }, ...] }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  users: expect.arrayContaining([
    expect.objectContaining({
      email: expect.any(String),
      isOwner: expect.any(Boolean)
    })
  ])
}));
```

**Error Conditions**: Missing auth, no project access, project not found, database errors

---

#### Test Case 2: View Permissions Without Project Access
**Test Name**: `should return error when user lacks project access`

**Expected Outputs**: HTTP 403, `{ error: "Access denied" }`

#### Test Case 3: View Permissions for Non-Existent Project
**Test Name**: `should return error when project does not exist`

**Expected Outputs**: HTTP 404, `{ error: "Project not found" }`

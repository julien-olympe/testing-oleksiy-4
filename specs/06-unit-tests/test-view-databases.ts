# View Databases Unit Test Specification

## Test File: `view-databases.test.ts`

### Purpose
Test the view databases functionality, including successful retrieval of databases in a project.

### Functions/APIs Being Tested
- `GET /api/projects/:projectId/databases` endpoint
- View databases service/function
- Project access verification
- Loading databases (including default database)

### Test Cases

#### Test Case 1: Successful View Databases
**Test Name**: `should return list of databases including default database when user has project access`

**Description**: Verifies that users with project access can view all databases in the project.

**Setup**:
- Mock authentication middleware
- Mock database queries for project databases

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
```

**Actions**:
1. Verify project access
2. Load all databases for project
3. Verify default database is included
4. Return database list

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ databases: [{ id: "...", name: "default database", schema_definition: {...}, ... }, ...] }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  databases: expect.arrayContaining([
    expect.objectContaining({
      name: 'default database',
      schema_definition: expect.objectContaining({
        string_prop: 'string'
      })
    })
  ])
}));
```

**Error Conditions**: Missing auth, no project access, project not found, database errors

---

#### Test Case 2: View Databases Without Project Access
**Test Name**: `should return error when user lacks project access`

**Expected Outputs**: HTTP 403, `{ error: "Access denied" }`

#### Test Case 3: View Databases for Non-Existent Project
**Test Name**: `should return error when project does not exist`

**Expected Outputs**: HTTP 404, `{ error: "Project not found" }`

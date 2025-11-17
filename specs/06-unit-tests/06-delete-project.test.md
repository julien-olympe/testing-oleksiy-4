# Delete Project Test

## Test Name
`delete-project.test.ts` - Project Deletion Tests

## Description
Comprehensive unit tests for the Delete Project use case. Tests permission validation, cascade deletion of related entities (functions, instances, permissions), and removal from display.

## Test Cases

### Test 1: Successful Project Deletion by Owner
**Test Name**: `should successfully delete project when user is owner`

**Description**: Verifies that project owner can delete their project, all related entities are deleted (cascade), and project is removed from display.

**Setup**:
- Mock authenticated user (project owner)
- Create test project with:
  - 2 functions
  - 3 database instances
  - 2 project permissions
- Mock database connection
- Mock cascade delete operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project with related entities
3. Call delete project API endpoint
4. Verify user authentication
5. Verify permission check (user is owner)
6. Verify project deletion
7. Verify cascade deletion of functions
8. Verify cascade deletion of database instances
9. Verify cascade deletion of project permissions
10. Verify project is removed from user's project list
11. Verify response indicates success

**Expected Results**:
- Status code: 200 (OK) or 204 (No Content)
- Response indicates success
- Project record deleted from database
- All functions deleted (cascade)
- All database instances deleted (cascade)
- All project permissions deleted (cascade, except RESTRICT constraints)
- Project removed from display
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Valid UUID
- Related functions: 2
- Related instances: 3
- Related permissions: 2

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns owner)
- Cascade delete service mock

**Assertions**:
1. Assert status code is 200 or 204
2. Assert project record is deleted
3. Assert all functions are deleted
4. Assert all database instances are deleted
5. Assert all project permissions are deleted
6. Assert project is removed from list

---

### Test 2: Delete Project Permission Denied
**Test Name**: `should reject delete when user does not have permission`

**Description**: Verifies that project deletion fails when user is not the owner and does not have permission.

**Setup**:
- Mock authenticated user (not owner, no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (not owner)
2. Prepare existing project owned by different user
3. Call delete project API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify project is NOT deleted

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- Project remains in database
- No cascade deletions occur

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert project is NOT deleted
4. Assert no cascade deletions occur

---

### Test 3: Delete Non-Existent Project
**Test Name**: `should reject delete when project does not exist`

**Description**: Verifies that project deletion fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Call delete project API endpoint
4. Verify project lookup returns no project
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No database deletion occurs

**Test Data**:
- Project ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no database deletion occurs

---

### Test 4: Delete Project Cascade Deletion
**Test Name**: `should delete all related entities when project is deleted`

**Description**: Verifies that all related entities are properly deleted when project is deleted (functions, database instances, permissions).

**Setup**:
- Mock authenticated user (project owner)
- Create test project with:
  - Functions with bricks and connections
  - Database instances with values
  - Project permissions
- Mock cascade delete operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project with complex related entities
3. Call delete project API endpoint
4. Verify project is deleted
5. Verify all functions are deleted
6. Verify all bricks in functions are deleted
7. Verify all brick connections are deleted
8. Verify all database instances are deleted
9. Verify all database instance values are deleted
10. Verify all project permissions are deleted (except RESTRICT constraints)

**Expected Results**:
- Status code: 200 (OK)
- Project deleted
- All functions deleted
- All bricks deleted
- All brick connections deleted
- All database instances deleted
- All database instance values deleted
- All project permissions deleted
- No orphaned records remain

**Test Data**:
- Project ID: Valid UUID
- Functions: 3 (each with 5 bricks and 10 connections)
- Database instances: 5 (each with 2 property values)
- Project permissions: 3

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Cascade delete service mock

**Assertions**:
1. Assert project is deleted
2. Assert all functions are deleted
3. Assert all bricks are deleted
4. Assert all connections are deleted
5. Assert all instances are deleted
6. Assert all values are deleted
7. Assert all permissions are deleted
8. Assert no orphaned records exist

---

### Test 5: Delete Project Transaction Rollback
**Test Name**: `should rollback transaction when project deletion fails`

**Description**: Verifies that database transaction is rolled back if project deletion fails partway through.

**Setup**:
- Mock authenticated user (project owner)
- Create test project with related entities
- Mock database delete to throw error during cascade

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project with related entities
3. Call delete project API endpoint
4. Simulate database error during cascade deletion
5. Verify transaction is rolled back
6. Verify no partial deletions occur

**Expected Results**:
- Status code: 500 (Internal Server Error)
- Error message: "Failed to delete project" or generic error
- No entities deleted (transaction rolled back)
- Project and all related entities remain intact

**Test Data**:
- Project ID: Valid UUID
- Related entities: Functions, instances, permissions

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (throws error during cascade)
- Transaction mock

**Assertions**:
1. Assert status code is 500
2. Assert no entities are deleted
3. Assert transaction was rolled back
4. Assert project and all related entities remain intact

---

### Test 6: Delete Project Response Time
**Test Name**: `should complete project deletion within performance requirements`

**Description**: Verifies that project deletion completes within the required response time (< 200ms for DELETE requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Call delete project API endpoint
4. Measure response time
5. Verify response time is < 200ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 200ms
- Project deletion succeeds

**Test Data**:
- Project ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 200ms
3. Assert project deletion succeeds

---

### Test 7: Delete Project with Invalid UUID
**Test Name**: `should reject delete when project ID is invalid UUID`

**Description**: Verifies that project deletion fails when project ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid project IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call delete project API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid project ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid project IDs: ["invalid-uuid", "123", "not-a-uuid", ""]

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made

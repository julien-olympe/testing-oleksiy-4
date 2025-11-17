# Rename Project Test

## Test Name
`rename-project.test.ts` - Project Rename Tests

## Description
Comprehensive unit tests for the Rename Project use case. Tests permission validation, name updates, persistence, and display updates.

## Test Cases

### Test 1: Successful Project Rename by Owner
**Test Name**: `should successfully rename project when user is owner`

**Description**: Verifies that project owner can rename their project, name is updated, persisted, and display is updated.

**Setup**:
- Mock authenticated user (project owner)
- Create test project owned by user
- Mock database connection
- Mock project update service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project (ID: valid UUID, name: "Old Name")
3. Call rename project API endpoint with new name "New Name"
4. Verify user authentication
5. Verify permission check (user is owner)
6. Verify project name validation passes
7. Verify project name is updated in database
8. Verify updated_at timestamp is updated
9. Verify response indicates success
10. Verify project list displays new name

**Expected Results**:
- Status code: 200 (OK) or 204 (No Content)
- Response indicates success
- Project record updated in database:
  - `name`: "New Name"
  - `updated_at`: Updated timestamp
- Project list displays new name
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Old name: "Old Name"
- New name: "New Name"
- Owner user ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns owner)
- Project update service mock

**Assertions**:
1. Assert status code is 200 or 204
2. Assert project name is updated in database
3. Assert updated_at timestamp is updated
4. Assert project list shows new name

---

### Test 2: Rename Project Permission Denied
**Test Name**: `should reject rename when user does not have permission`

**Description**: Verifies that project rename fails when user is not the owner and does not have permission.

**Setup**:
- Mock authenticated user (not owner, no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (not owner)
2. Prepare existing project owned by different user
3. Call rename project API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify project name is NOT updated

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- Project name remains unchanged
- No database update occurs

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)
- New name: "New Name"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert project name is NOT updated
4. Assert updated_at timestamp is NOT changed

---

### Test 3: Rename Project with Invalid Project Name
**Test Name**: `should reject rename when project name is invalid`

**Description**: Verifies that project rename fails when new name is invalid (empty, too long, invalid characters).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock name validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Attempt to rename with invalid names:
   - Empty string: ""
   - Whitespace only: "   "
   - Too long: 256+ characters
   - Null: null
   - Undefined: undefined
4. For each invalid name, call rename API endpoint
5. Verify name validation fails
6. Verify error response is returned
7. Verify project name is NOT updated

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid project name"
- Project name remains unchanged

**Test Data**:
- Project ID: Valid UUID
- Invalid names: ["", "   ", "a" * 256, null, undefined]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project name validation mock

**Assertions**:
1. Assert status code is 400 for each invalid name
2. Assert error message is "Invalid project name"
3. Assert project name is NOT updated

---

### Test 4: Rename Non-Existent Project
**Test Name**: `should reject rename when project does not exist`

**Description**: Verifies that project rename fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Call rename project API endpoint
4. Verify project lookup returns no project
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No database update occurs

**Test Data**:
- Project ID: Valid UUID (but non-existent)
- New name: "New Name"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no database update occurs

---

### Test 5: Rename Project with Same Name
**Test Name**: `should handle rename when new name is same as current name`

**Description**: Verifies that renaming to the same name is handled correctly (idempotent operation).

**Setup**:
- Mock authenticated user (project owner)
- Create test project with name "Existing Name"

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project with name "Existing Name"
3. Call rename project API endpoint with same name "Existing Name"
4. Verify operation succeeds (idempotent)
5. Verify project name remains "Existing Name"

**Expected Results**:
- Status code: 200 (OK)
- Operation succeeds (idempotent)
- Project name remains unchanged
- updated_at may or may not be updated (implementation dependent)

**Test Data**:
- Project ID: Valid UUID
- Current name: "Existing Name"
- New name: "Existing Name" (same)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock

**Assertions**:
1. Assert status code is 200
2. Assert operation succeeds
3. Assert project name remains "Existing Name"

---

### Test 6: Rename Project Response Time
**Test Name**: `should complete project rename within performance requirements`

**Description**: Verifies that project rename completes within the required response time (< 250ms for PUT requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Call rename project API endpoint
4. Measure response time
5. Verify response time is < 250ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 250ms
- Project rename succeeds

**Test Data**:
- Project ID: Valid UUID
- New name: "New Name"

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 250ms
3. Assert project rename succeeds

---

### Test 7: Rename Project with Invalid UUID
**Test Name**: `should reject rename when project ID is invalid UUID`

**Description**: Verifies that project rename fails when project ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid project IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call rename project API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid project ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid project IDs: ["invalid-uuid", "123", "not-a-uuid", ""]
- New name: "New Name"

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made

# Rename Function Test

## Test Name
`rename-function.test.ts` - Function Rename Tests

## Description
Comprehensive unit tests for the Rename Function use case. Tests permission validation, name updates, persistence, and display updates.

## Test Cases

### Test 1: Successful Function Rename by Owner
**Test Name**: `should successfully rename function when user is project owner`

**Description**: Verifies that project owner can rename function, name is updated, persisted, and display is updated.

**Setup**:
- Mock authenticated user (project owner)
- Create test project with function
- Mock database connection
- Mock function update service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function (ID: valid UUID, name: "Old Name", project ID: valid UUID)
3. Call rename function API endpoint with new name "New Name"
4. Verify user authentication
5. Verify permission check (user is project owner)
6. Verify function name validation passes
7. Verify function name is updated in database
8. Verify updated_at timestamp is updated
9. Verify response indicates success
10. Verify function list displays new name

**Expected Results**:
- Status code: 200 (OK) or 204 (No Content)
- Response indicates success
- Function record updated in database:
  - `name`: "New Name"
  - `updated_at`: Updated timestamp
- Function list displays new name
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- Old name: "Old Name"
- New name: "New Name"
- Project ID: Valid UUID
- Owner user ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns owner)
- Function update service mock

**Assertions**:
1. Assert status code is 200 or 204
2. Assert function name is updated in database
3. Assert updated_at timestamp is updated
4. Assert function list shows new name

---

### Test 2: Rename Function Permission Denied
**Test Name**: `should reject rename when user does not have project permission`

**Description**: Verifies that function rename fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test project with function owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing function in project owned by different user
3. Call rename function API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify function name is NOT updated

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- Function name remains unchanged
- No database update occurs

**Test Data**:
- Function ID: Valid UUID
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
3. Assert function name is NOT updated
4. Assert updated_at timestamp is NOT changed

---

### Test 3: Rename Function with Invalid Function Name
**Test Name**: `should reject rename when function name is invalid`

**Description**: Verifies that function rename fails when new name is invalid (empty, too long, invalid characters).

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock name validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Attempt to rename with invalid names:
   - Empty string: ""
   - Whitespace only: "   "
   - Too long: 256+ characters
   - Null: null
   - Undefined: undefined
4. For each invalid name, call rename API endpoint
5. Verify name validation fails
6. Verify error response is returned
7. Verify function name is NOT updated

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid function name"
- Function name remains unchanged

**Test Data**:
- Function ID: Valid UUID
- Invalid names: ["", "   ", "a" * 256, null, undefined]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function name validation mock

**Assertions**:
1. Assert status code is 400 for each invalid name
2. Assert error message is "Invalid function name"
3. Assert function name is NOT updated

---

### Test 4: Rename Non-Existent Function
**Test Name**: `should reject rename when function does not exist`

**Description**: Verifies that function rename fails when function ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no function

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent function ID
3. Call rename function API endpoint
4. Verify function lookup returns no function
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Function not found"
- No database update occurs

**Test Data**:
- Function ID: Valid UUID (but non-existent)
- New name: "New Name"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no function)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Function not found"
3. Assert no database update occurs

---

### Test 5: Rename Function with Same Name
**Test Name**: `should handle rename when new name is same as current name`

**Description**: Verifies that renaming to the same name is handled correctly (idempotent operation).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with name "Existing Name"

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with name "Existing Name"
3. Call rename function API endpoint with same name "Existing Name"
4. Verify operation succeeds (idempotent)
5. Verify function name remains "Existing Name"

**Expected Results**:
- Status code: 200 (OK)
- Operation succeeds (idempotent)
- Function name remains unchanged
- updated_at may or may not be updated (implementation dependent)

**Test Data**:
- Function ID: Valid UUID
- Current name: "Existing Name"
- New name: "Existing Name" (same)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock

**Assertions**:
1. Assert status code is 200
2. Assert operation succeeds
3. Assert function name remains "Existing Name"

---

### Test 6: Rename Function Response Time
**Test Name**: `should complete function rename within performance requirements`

**Description**: Verifies that function rename completes within the required response time (< 250ms for PUT requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Call rename function API endpoint
4. Measure response time
5. Verify response time is < 250ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 250ms
- Function rename succeeds

**Test Data**:
- Function ID: Valid UUID
- New name: "New Name"

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 250ms
3. Assert function rename succeeds

---

### Test 7: Rename Function with Invalid UUID
**Test Name**: `should reject rename when function ID is invalid UUID`

**Description**: Verifies that function rename fails when function ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid function IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call rename function API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid function ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid function IDs: ["invalid-uuid", "123", "not-a-uuid", ""]
- New name: "New Name"

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made

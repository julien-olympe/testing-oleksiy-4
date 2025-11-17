# Delete Function Test

## Test Name
`delete-function.test.ts` - Function Deletion Tests

## Description
Comprehensive unit tests for the Delete Function use case. Tests permission validation, cascade deletion of related entities (bricks, connections), and removal from project.

## Test Cases

### Test 1: Successful Function Deletion by Owner
**Test Name**: `should successfully delete function when user is project owner`

**Description**: Verifies that project owner can delete function, all related entities are deleted (cascade), and function is removed from project.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with:
  - 5 bricks
  - 10 brick connections
- Mock database connection
- Mock cascade delete operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with related entities
3. Call delete function API endpoint
4. Verify user authentication
5. Verify permission check (user is project owner)
6. Verify function deletion
7. Verify cascade deletion of bricks
8. Verify cascade deletion of brick connections
9. Verify function is removed from project's function list
10. Verify response indicates success

**Expected Results**:
- Status code: 200 (OK) or 204 (No Content)
- Response indicates success
- Function record deleted from database
- All bricks deleted (cascade)
- All brick connections deleted (cascade)
- Function removed from project
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- Project ID: Valid UUID
- Owner user ID: Valid UUID
- Related bricks: 5
- Related connections: 10

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns owner)
- Cascade delete service mock

**Assertions**:
1. Assert status code is 200 or 204
2. Assert function record is deleted
3. Assert all bricks are deleted
4. Assert all brick connections are deleted
5. Assert function is removed from project

---

### Test 2: Delete Function Permission Denied
**Test Name**: `should reject delete when user does not have project permission`

**Description**: Verifies that function deletion fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test function in project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing function in project owned by different user
3. Call delete function API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify function is NOT deleted

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- Function remains in database
- No cascade deletions occur

**Test Data**:
- Function ID: Valid UUID
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
3. Assert function is NOT deleted
4. Assert no cascade deletions occur

---

### Test 3: Delete Non-Existent Function
**Test Name**: `should reject delete when function does not exist`

**Description**: Verifies that function deletion fails when function ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no function

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent function ID
3. Call delete function API endpoint
4. Verify function lookup returns no function
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Function not found"
- No database deletion occurs

**Test Data**:
- Function ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no function)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Function not found"
3. Assert no database deletion occurs

---

### Test 4: Delete Function Cascade Deletion
**Test Name**: `should delete all related entities when function is deleted`

**Description**: Verifies that all related entities are properly deleted when function is deleted (bricks, connections).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with:
  - Bricks with configurations
  - Connections between bricks
- Mock cascade delete operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with complex related entities
3. Call delete function API endpoint
4. Verify function is deleted
5. Verify all bricks are deleted
6. Verify all brick connections are deleted
7. Verify no orphaned records remain

**Expected Results**:
- Status code: 200 (OK)
- Function deleted
- All bricks deleted
- All brick connections deleted
- No orphaned records remain

**Test Data**:
- Function ID: Valid UUID
- Bricks: 10 (each with configuration)
- Connections: 20

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Cascade delete service mock

**Assertions**:
1. Assert function is deleted
2. Assert all bricks are deleted
3. Assert all connections are deleted
4. Assert no orphaned records exist

---

### Test 5: Delete Function Transaction Rollback
**Test Name**: `should rollback transaction when function deletion fails`

**Description**: Verifies that database transaction is rolled back if function deletion fails partway through.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with related entities
- Mock database delete to throw error during cascade

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with related entities
3. Call delete function API endpoint
4. Simulate database error during cascade deletion
5. Verify transaction is rolled back
6. Verify no partial deletions occur

**Expected Results**:
- Status code: 500 (Internal Server Error)
- Error message: "Failed to delete function" or generic error
- No entities deleted (transaction rolled back)
- Function and all related entities remain intact

**Test Data**:
- Function ID: Valid UUID
- Related entities: Bricks, connections

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (throws error during cascade)
- Transaction mock

**Assertions**:
1. Assert status code is 500
2. Assert no entities are deleted
3. Assert transaction was rolled back
4. Assert function and all related entities remain intact

---

### Test 6: Delete Function Response Time
**Test Name**: `should complete function deletion within performance requirements`

**Description**: Verifies that function deletion completes within the required response time (< 200ms for DELETE requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Call delete function API endpoint
4. Measure response time
5. Verify response time is < 200ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 200ms
- Function deletion succeeds

**Test Data**:
- Function ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 200ms
3. Assert function deletion succeeds

---

### Test 7: Delete Function with Invalid UUID
**Test Name**: `should reject delete when function ID is invalid UUID`

**Description**: Verifies that function deletion fails when function ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid function IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call delete function API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid function ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid function IDs: ["invalid-uuid", "123", "not-a-uuid", ""]

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made

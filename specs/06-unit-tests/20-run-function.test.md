# Run Function Test

## Test Name
`run-function.test.ts` - Function Execution Tests

## Description
Comprehensive unit tests for the Run Function use case. Tests validation of required inputs, validation of brick connections, logic execution in order, data retrieval from instances, processing through chain, console output, and error handling.

## Test Cases

### Test 1: Successful Function Execution
**Test Name**: `should successfully execute function when all inputs are configured and connections are valid`

**Description**: Verifies that clicking RUN button executes function logic, validates required inputs, validates connections, executes logic in order, retrieves data, processes through chain, and outputs to console.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with:
  - "ListInstancesByDB" brick (input: "default database" configured)
  - "GetFirstInstance" brick
  - "LogInstanceProps" brick
  - Connections: ListInstancesByDB → GetFirstInstance → LogInstanceProps
- Create database instances with values
- Mock function execution service
- Mock console output

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with complete brick chain
3. Prepare database instances (default database with string values)
4. Simulate clicking RUN button
5. Call run function API endpoint
6. Verify user authentication
7. Verify function permission check
8. Verify required inputs are configured (database name set)
9. Verify brick connections are valid
10. Verify logic executes in order:
    - ListInstancesByDB retrieves instances
    - GetFirstInstance gets first instance
    - LogInstanceProps outputs to console
11. Verify data is retrieved from instances
12. Verify results are output to console
13. Verify response indicates success

**Expected Results**:
- Status code: 200 (OK)
- Response indicates successful execution
- Function logic executes in correct order
- Data is retrieved from database instances
- Results are output to console
- Execution completes within 2 seconds
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- Bricks: ListInstancesByDB, GetFirstInstance, LogInstanceProps
- Connections: Complete chain
- Database instances: 3 instances with string values
- Input parameter: "default database"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns permission)
- Function execution service mock
- Console output mock

**Assertions**:
1. Assert status code is 200
2. Assert function execution succeeds
3. Assert logic executes in correct order
4. Assert data is retrieved correctly
5. Assert results are output to console
6. Assert execution time is < 2 seconds

---

### Test 2: Run Function Missing Required Inputs
**Test Name**: `should reject execution when required inputs are not configured`

**Description**: Verifies that function execution fails when required inputs are not configured (e.g., database name not set on ListInstancesByDB).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with:
  - "ListInstancesByDB" brick (input: NOT configured)
  - Other bricks and connections
- Mock input validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with unconfigured required input
3. Call run function API endpoint
4. Verify required input validation fails
5. Verify error response is returned
6. Verify function does not execute

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Missing required inputs"
- Function does not execute
- No console output

**Test Data**:
- Function ID: Valid UUID
- Bricks: ListInstancesByDB (input not configured), GetFirstInstance, LogInstanceProps
- Connections: Complete chain

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Input validation mock (returns missing)

**Assertions**:
1. Assert status code is 400
2. Assert error message is "Missing required inputs"
3. Assert function does not execute
4. Assert no console output

---

### Test 3: Run Function Invalid Brick Connections
**Test Name**: `should reject execution when brick connections are invalid`

**Description**: Verifies that function execution fails when brick connections are invalid (missing connections, broken chain, incompatible types).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with:
  - Bricks not properly connected
  - Broken chain (missing connection)
  - Incompatible types in connections
- Mock connection validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with invalid connections:
   - Missing connection between bricks
   - Broken chain
   - Incompatible types
3. For each invalid connection scenario, call run function API endpoint
4. Verify connection validation fails
5. Verify error response is returned
6. Verify function does not execute

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid brick connections"
- Function does not execute
- No console output

**Test Data**:
- Function ID: Valid UUID
- Invalid connection scenarios:
  - Missing connection
  - Broken chain
  - Incompatible types

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Connection validation mock (returns invalid)

**Assertions**:
1. Assert status code is 400
2. Assert error message is "Invalid brick connections"
3. Assert function does not execute
4. Assert no console output

---

### Test 4: Run Function Permission Denied
**Test Name**: `should reject execution when user does not have function permission`

**Description**: Verifies that function execution fails when user does not have permission to access the function's project.

**Setup**:
- Mock authenticated user (no permission)
- Create test function in project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing function in project owned by different user
3. Call run function API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify function does not execute

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- Function does not execute
- No console output

**Test Data**:
- Function ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert function does not execute
4. Assert no console output

---

### Test 5: Run Function Execution Timeout
**Test Name**: `should timeout execution when function exceeds maximum execution time`

**Description**: Verifies that function execution is terminated and times out when execution exceeds 2 seconds.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with slow execution (simulated)
- Mock execution timeout mechanism

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with slow execution
3. Call run function API endpoint
4. Verify execution starts
5. Verify timeout is enforced at 2 seconds
6. Verify execution is terminated
7. Verify error response is returned

**Expected Results**:
- Status code: 408 (Request Timeout) or 500 (Internal Server Error)
- Error message: "Function execution timeout" or "Execution failed"
- Function execution is terminated
- Execution time logged

**Test Data**:
- Function ID: Valid UUID
- Execution time: > 2 seconds (simulated)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Execution timeout mock

**Assertions**:
1. Assert status code is 408 or 500
2. Assert error message indicates timeout
3. Assert execution is terminated
4. Assert execution time is logged

---

### Test 6: Run Function Empty Function
**Test Name**: `should handle execution when function has no bricks`

**Description**: Verifies that function execution handles empty functions correctly (no bricks, no connections).

**Setup**:
- Mock authenticated user (project owner)
- Create empty test function (no bricks)

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare empty function
3. Call run function API endpoint
4. Verify execution handles empty function
5. Verify appropriate response (success with no output, or error)

**Expected Results**:
- Either:
  - Status code: 200 (OK) - if empty functions are allowed
  - Status code: 400 (Bad Request) - if empty functions are not allowed
- Error message (if not allowed): "Function has no bricks" or "Invalid brick connections"

**Test Data**:
- Function ID: Valid UUID
- Bricks: 0
- Connections: 0

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock

**Assertions**:
1. Assert appropriate status code based on empty function policy
2. If not allowed, assert error message indicates empty function
3. If allowed, assert execution succeeds with no output

---

### Test 7: Run Function Execution Order
**Test Name**: `should execute bricks in correct order based on connections`

**Description**: Verifies that function execution follows correct order based on brick connections (topological sort).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with complex brick chain
- Mock execution order tracking

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with complex chain:
   - Brick A → Brick B → Brick C
   - Brick D → Brick C
3. Call run function API endpoint
4. Verify execution order is determined correctly (topological sort)
5. Verify bricks execute in correct order:
   - Brick A and Brick D execute first (no dependencies)
   - Brick B executes after Brick A
   - Brick C executes after Brick B and Brick D
6. Verify execution completes successfully

**Expected Results**:
- Status code: 200 (OK)
- Execution order is correct (topological sort)
- All bricks execute in proper order
- Execution completes successfully

**Test Data**:
- Function ID: Valid UUID
- Bricks: A, B, C, D
- Connections: A→B→C, D→C

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Execution order tracking mock

**Assertions**:
1. Assert status code is 200
2. Assert execution order is correct
3. Assert all bricks execute in proper order
4. Assert execution completes successfully

---

### Test 8: Run Function Response Time
**Test Name**: `should complete function execution within performance requirements`

**Description**: Verifies that function execution completes within the required response time (considering 2 second execution limit).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with fast execution
- Mock fast execution service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with fast execution
3. Call run function API endpoint
4. Measure response time
5. Verify response time is acceptable (< 2 seconds for execution + overhead)

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 2 seconds (execution) + overhead
- Function execution succeeds

**Test Data**:
- Function ID: Valid UUID
- Execution time: < 2 seconds

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)
- Execution service mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is acceptable
3. Assert function execution succeeds

---

### Test 9: Run Function Non-Existent Function
**Test Name**: `should reject execution when function does not exist`

**Description**: Verifies that function execution fails when function ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no function

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent function ID
3. Call run function API endpoint
4. Verify function lookup returns no function
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Function not found"
- No execution occurs

**Test Data**:
- Function ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no function)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Function not found"
3. Assert no execution occurs

---

### Test 10: Run Function Invalid UUID
**Test Name**: `should reject execution when function ID is invalid UUID`

**Description**: Verifies that function execution fails when function ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid function IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call run function API endpoint
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

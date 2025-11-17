# Link Bricks Test

## Test Name
`link-bricks.test.ts` - Brick Connection Tests

## Description
Comprehensive unit tests for the Link Bricks use case. Tests type compatibility validation, link creation, visual connection display, and auto-persistence.

## Test Cases

### Test 1: Successful Brick Linking
**Test Name**: `should successfully link bricks when types are compatible`

**Description**: Verifies that connecting output to input creates a link, types are validated as compatible, connection line is displayed, and link is auto-persisted.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with two bricks:
  - Source brick: "ListInstancesByDB" (output: "List")
  - Target brick: "GetFirstInstance" (input: "List")
- Mock database connection
- Mock type compatibility validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with two bricks
3. Simulate dragging connection from source output to target input
4. Call link bricks API endpoint
5. Verify user authentication
6. Verify function permission check
7. Verify type compatibility check (output type matches input type)
8. Verify no duplicate link exists
9. Verify link is created in database
10. Verify connection line is displayed
11. Verify auto-persistence occurs
12. Verify response indicates success

**Expected Results**:
- Status code: 201 (Created)
- Response contains link ID (UUID)
- Link record exists in database with:
  - `id`: Valid UUID
  - `from_brick_id`: Source brick ID
  - `from_output_name`: "List"
  - `to_brick_id`: Target brick ID
  - `to_input_name`: "List"
  - `created_at`: Current timestamp
- Connection line is displayed visually
- Auto-persistence occurs
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- Source brick ID: Valid UUID (ListInstancesByDB)
- Source output: "List"
- Target brick ID: Valid UUID (GetFirstInstance)
- Target input: "List"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns permission)
- Type compatibility validation mock
- Link creation service mock

**Assertions**:
1. Assert status code is 201
2. Assert response contains link ID
3. Assert link record exists in database
4. Assert from_brick_id matches source brick
5. Assert from_output_name matches source output
6. Assert to_brick_id matches target brick
7. Assert to_input_name matches target input
8. Assert created_at timestamp is set
9. Assert connection line is displayed
10. Assert auto-persistence occurs

---

### Test 2: Link Bricks Incompatible Types
**Test Name**: `should reject linking when types are incompatible`

**Description**: Verifies that linking fails when output type is incompatible with input type.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with two bricks:
  - Source brick: "ListInstancesByDB" (output: "List")
  - Target brick: "LogInstanceProps" (input: "Object")
- Mock type compatibility validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with two bricks
3. Attempt to link incompatible types (List to Object)
4. Call link bricks API endpoint
5. Verify type compatibility check fails
6. Verify error response is returned
7. Verify no link is created

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Incompatible types"
- No link record created
- No connection line displayed

**Test Data**:
- Function ID: Valid UUID
- Source brick ID: Valid UUID (ListInstancesByDB)
- Source output: "List"
- Target brick ID: Valid UUID (LogInstanceProps)
- Target input: "Object"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Type compatibility validation mock (returns incompatible)

**Assertions**:
1. Assert status code is 400
2. Assert error message is "Incompatible types"
3. Assert no link record is created
4. Assert no connection line is displayed

---

### Test 3: Link Bricks Duplicate Link
**Test Name**: `should reject linking when link already exists`

**Description**: Verifies that linking fails when a link already exists between the same output and input (unique constraint).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with two bricks
- Create existing link between the bricks
- Mock link lookup

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with two bricks
3. Prepare existing link between the bricks
4. Attempt to create duplicate link
5. Call link bricks API endpoint
6. Verify existing link is detected
7. Verify error response is returned
8. Verify no duplicate link is created

**Expected Results**:
- Status code: 400 (Bad Request) or 409 (Conflict)
- Error message: "Link already exists"
- No duplicate link record created
- Existing link remains unchanged

**Test Data**:
- Function ID: Valid UUID
- Source brick ID: Valid UUID
- Source output: "List"
- Target brick ID: Valid UUID
- Target input: "List"
- Existing link: Already exists

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Link lookup mock (returns existing link)

**Assertions**:
1. Assert status code is 400 or 409
2. Assert error message is "Link already exists"
3. Assert no duplicate link is created
4. Assert existing link remains unchanged

---

### Test 4: Link Bricks Permission Denied
**Test Name**: `should reject linking when user does not have function permission`

**Description**: Verifies that linking fails when user does not have permission to access the function's project.

**Setup**:
- Mock authenticated user (no permission)
- Create test function in project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing function in project owned by different user
3. Prepare two bricks in function
4. Call link bricks API endpoint
5. Verify permission check fails
6. Verify error response is returned
7. Verify no link is created

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No link record created

**Test Data**:
- Function ID: Valid UUID
- Source brick ID: Valid UUID
- Target brick ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert no link record is created

---

### Test 5: Link Bricks Non-Existent Bricks
**Test Name**: `should reject linking when source or target brick does not exist`

**Description**: Verifies that linking fails when source brick or target brick ID does not exist.

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock database query to return no brick

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Prepare non-existent source brick ID
4. Prepare valid target brick ID
5. Call link bricks API endpoint
6. Verify source brick lookup returns no brick
7. Verify error response is returned
8. Repeat with non-existent target brick

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Source brick not found" or "Target brick not found"
- No link record created

**Test Data**:
- Function ID: Valid UUID
- Source brick ID: Valid UUID (but non-existent)
- Target brick ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no brick)

**Assertions**:
1. Assert status code is 404
2. Assert error message indicates brick not found
3. Assert no link record is created

---

### Test 6: Link Bricks Same Brick
**Test Name**: `should reject linking when source and target are the same brick`

**Description**: Verifies that linking fails when attempting to link a brick's output to its own input (self-loop prevention, if applicable).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with one brick

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with one brick
3. Attempt to link brick's output to its own input
4. Call link bricks API endpoint
5. Verify self-loop validation fails (if enforced)
6. Verify error response is returned (if enforced) or link is created (if allowed)

**Expected Results**:
- Either:
  - Status code: 400 (Bad Request) - if self-loops are not allowed
  - Status code: 201 (Created) - if self-loops are allowed
- Error message (if not allowed): "Cannot link brick to itself"

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID (same for source and target)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Self-loop validation mock

**Assertions**:
1. Assert appropriate status code based on self-loop policy
2. If not allowed, assert error message indicates self-loop not allowed
3. If allowed, assert link is created

---

### Test 7: Link Bricks Auto-Persistence
**Test Name**: `should auto-persist link creation within debounce delay`

**Description**: Verifies that link creation is automatically persisted within the debounce delay (500ms).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with two bricks
- Mock auto-save mechanism with 500ms debounce

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with two bricks
3. Call link bricks API endpoint
4. Verify debounce mechanism is triggered
5. Wait for debounce delay (500ms)
6. Verify auto-persistence occurs
7. Verify link is saved within 1 second

**Expected Results**:
- Status code: 201 (Created)
- Debounce mechanism is triggered
- Auto-persistence occurs within 500ms debounce
- Link is saved within 1 second
- No explicit save button required

**Test Data**:
- Function ID: Valid UUID
- Source brick ID: Valid UUID
- Target brick ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Auto-save mechanism mock (500ms debounce)

**Assertions**:
1. Assert debounce mechanism is triggered
2. Assert auto-persistence occurs within debounce delay
3. Assert link is saved within 1 second
4. Assert no explicit save is required

---

### Test 8: Link Bricks Response Time
**Test Name**: `should complete link creation within performance requirements`

**Description**: Verifies that link creation completes within the required response time (< 300ms for POST requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with two bricks
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with two bricks
3. Call link bricks API endpoint
4. Measure response time
5. Verify response time is < 300ms

**Expected Results**:
- Status code: 201 (Created)
- Response time: < 300ms
- Link creation succeeds

**Test Data**:
- Function ID: Valid UUID
- Source brick ID: Valid UUID
- Target brick ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 201
2. Assert response time is < 300ms
3. Assert link creation succeeds

---

### Test 9: Link Bricks Invalid UUIDs
**Test Name**: `should reject linking when brick IDs are invalid UUIDs`

**Description**: Verifies that linking fails when source brick ID or target brick ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid source brick IDs:
   - "invalid-uuid"
   - "123"
3. Prepare invalid target brick IDs:
   - "invalid-uuid"
   - "123"
4. For each invalid ID combination, call link bricks API endpoint
5. Verify UUID validation fails
6. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid brick ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid source brick IDs: ["invalid-uuid", "123"]
- Invalid target brick IDs: ["invalid-uuid", "123"]

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made

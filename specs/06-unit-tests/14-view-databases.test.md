# View Databases Test

## Test Name
`view-databases.test.ts` - Database Types Viewing Tests

## Description
Comprehensive unit tests for the View Databases use case. Tests permission validation, retrieval of database types (including default database), and display in database list.

## Test Cases

### Test 1: Successful Databases View
**Test Name**: `should successfully view databases when user has permission`

**Description**: Verifies that user with permission can view database types, default database is included, and list is displayed.

**Setup**:
- Mock authenticated user (project owner or with permission)
- Create test project
- Mock database connection
- Mock database type retrieval service
- Ensure default database exists

**Test Steps**:
1. Prepare authenticated user context
2. Prepare existing project
3. Simulate clicking Database tab
4. Call view databases API endpoint
5. Verify user authentication
6. Verify permission check passes
7. Verify all database types are retrieved
8. Verify default database is included in list
9. Verify response contains database types list
10. Verify database types list is displayed

**Expected Results**:
- Status code: 200 (OK)
- Response contains:
  - Database types list
  - Default database is included with:
    - `id`: Valid UUID
    - `name`: "default database"
    - Properties list (including string property)
- Database types list is displayed correctly
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- User ID: Valid UUID (owner or with permission)
- Default database: System database

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns permission)
- Database type retrieval service mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains database types list
3. Assert default database is included in list
4. Assert default database has correct name
5. Assert default database has properties
6. Assert database types list is displayed correctly

---

### Test 2: View Databases Permission Denied
**Test Name**: `should reject viewing databases when user does not have permission`

**Description**: Verifies that viewing databases fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing project owned by different user
3. Call view databases API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify no database data is returned

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No database data returned
- Database list is not displayed

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
3. Assert no database data is returned
4. Assert database list is not displayed

---

### Test 3: View Databases Non-Existent Project
**Test Name**: `should reject viewing databases when project does not exist`

**Description**: Verifies that viewing databases fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Call view databases API endpoint
4. Verify project lookup returns no project
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No database data returned

**Test Data**:
- Project ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no database data is returned

---

### Test 4: View Databases Default Database Properties
**Test Name**: `should include default database properties in response`

**Description**: Verifies that default database includes all its properties (string property) in the response.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Ensure default database with properties exists

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Call view databases API endpoint
4. Verify default database is included
5. Verify default database has properties list
6. Verify string property is included with correct type

**Expected Results**:
- Status code: 200 (OK)
- Response contains default database
- Default database has properties list
- String property exists with:
  - `name`: "string"
  - `type`: "string"

**Test Data**:
- Project ID: Valid UUID
- Default database: System database with string property

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock
- Database type retrieval service mock

**Assertions**:
1. Assert status code is 200
2. Assert default database is included
3. Assert default database has properties
4. Assert string property exists with correct type

---

### Test 5: View Databases Response Time
**Test Name**: `should complete viewing databases within performance requirements`

**Description**: Verifies that viewing databases completes within the required response time (< 200ms for GET requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Call view databases API endpoint
4. Measure response time
5. Verify response time is < 200ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 200ms
- Databases viewing succeeds

**Test Data**:
- Project ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 200ms
3. Assert databases viewing succeeds

---

### Test 6: View Databases with Invalid UUID
**Test Name**: `should reject viewing databases when project ID is invalid UUID`

**Description**: Verifies that viewing databases fails when project ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid project IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call view databases API endpoint
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

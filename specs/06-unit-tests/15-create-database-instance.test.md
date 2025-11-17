# Create Database Instance Test

## Test Name
`create-database-instance.test.ts` - Database Instance Creation Tests

## Description
Comprehensive unit tests for the Create Database Instance use case. Tests permission validation, instance creation, property initialization, project assignment, and display in instances list.

## Test Cases

### Test 1: Successful Database Instance Creation
**Test Name**: `should successfully create database instance when user has permission`

**Description**: Verifies that user with permission can create database instance, instance is created with initialized properties, assigned to project, and displayed in list.

**Setup**:
- Mock authenticated user (project owner or with permission)
- Create test project
- Create default database type
- Mock database connection
- Mock instance creation service

**Test Steps**:
1. Prepare authenticated user context
2. Prepare existing project (ID: valid UUID)
3. Prepare database type (default database)
4. Simulate clicking "Create instance" button
5. Call create database instance API endpoint
6. Verify user authentication
7. Verify permission check passes
8. Verify database type exists
9. Verify instance is created
10. Verify all properties are initialized (empty values)
11. Verify instance is assigned to project
12. Verify instance appears in instances list
13. Verify response indicates success

**Expected Results**:
- Status code: 201 (Created)
- Response contains instance ID (UUID)
- Instance record exists in database with:
  - `id`: Valid UUID
  - `database_id`: Database type ID
  - `created_at`: Current timestamp
  - `updated_at`: Current timestamp
- Instance values are initialized for all properties (empty)
- Instance appears in database instances list
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Database type ID: Valid UUID (default database)
- Properties: String property (initialized empty)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns permission)
- Instance creation service mock

**Assertions**:
1. Assert status code is 201
2. Assert response contains instance ID
3. Assert instance record exists in database
4. Assert database_id matches database type ID
5. Assert created_at and updated_at are set
6. Assert instance values are initialized
7. Assert instance appears in instances list

---

### Test 2: Create Instance Permission Denied
**Test Name**: `should reject instance creation when user does not have permission`

**Description**: Verifies that instance creation fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing project owned by different user
3. Prepare database type
4. Call create database instance API endpoint
5. Verify permission check fails
6. Verify error response is returned
7. Verify no instance is created

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No instance record created

**Test Data**:
- Project ID: Valid UUID
- Database type ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert no instance record is created

---

### Test 3: Create Instance Non-Existent Database Type
**Test Name**: `should reject instance creation when database type does not exist`

**Description**: Verifies that instance creation fails when database type ID does not exist.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock database query to return no database type

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare non-existent database type ID
4. Call create database instance API endpoint
5. Verify database type lookup returns no type
6. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Database type not found"
- No instance record created

**Test Data**:
- Project ID: Valid UUID
- Database type ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Database type lookup mock (returns no type)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Database type not found"
3. Assert no instance record is created

---

### Test 4: Create Instance Non-Existent Project
**Test Name**: `should reject instance creation when project does not exist`

**Description**: Verifies that instance creation fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Prepare database type
4. Call create database instance API endpoint
5. Verify project lookup returns no project
6. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No instance record created

**Test Data**:
- Project ID: Valid UUID (but non-existent)
- Database type ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no instance record is created

---

### Test 5: Create Instance Property Initialization
**Test Name**: `should initialize all properties when creating instance`

**Description**: Verifies that all properties of the database type are initialized when creating instance.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Create database type with multiple properties (string, number, boolean)

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare database type with multiple properties
4. Call create database instance API endpoint
5. Verify instance is created
6. Verify instance values are created for all properties
7. Verify all property values are initialized (empty/default)

**Expected Results**:
- Status code: 201 (Created)
- Instance created
- Instance values created for all properties:
  - String property: Empty string ""
  - Number property: 0 or null
  - Boolean property: false or null
- All properties are initialized

**Test Data**:
- Project ID: Valid UUID
- Database type ID: Valid UUID
- Properties: String, number, boolean

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock
- Instance creation service mock

**Assertions**:
1. Assert status code is 201
2. Assert instance is created
3. Assert instance values are created for all properties
4. Assert all properties are initialized correctly

---

### Test 6: Create Instance Database Transaction Rollback
**Test Name**: `should rollback transaction when instance creation fails`

**Description**: Verifies that database transaction is rolled back if instance creation fails after validation.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Create database type
- Mock database insert to throw error

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare database type
4. Call create database instance API endpoint
5. Simulate database error during instance creation
6. Verify transaction is rolled back
7. Verify no partial data is saved

**Expected Results**:
- Status code: 500 (Internal Server Error)
- Error message: "Failed to create instance" or generic error
- No instance record created
- Transaction rolled back completely

**Test Data**:
- Project ID: Valid UUID
- Database type ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (throws error on insert)
- Transaction mock

**Assertions**:
1. Assert status code is 500
2. Assert no instance record is created
3. Assert transaction was rolled back

---

### Test 7: Create Instance Response Time
**Test Name**: `should complete instance creation within performance requirements`

**Description**: Verifies that instance creation completes within the required response time (< 300ms for POST requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Create database type
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare database type
4. Call create database instance API endpoint
5. Measure response time
6. Verify response time is < 300ms

**Expected Results**:
- Status code: 201 (Created)
- Response time: < 300ms
- Instance creation succeeds

**Test Data**:
- Project ID: Valid UUID
- Database type ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 201
2. Assert response time is < 300ms
3. Assert instance creation succeeds

---

### Test 8: Create Instance with Invalid UUIDs
**Test Name**: `should reject instance creation when IDs are invalid UUIDs`

**Description**: Verifies that instance creation fails when project ID or database type ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid project IDs:
   - "invalid-uuid"
   - "123"
3. Prepare invalid database type IDs:
   - "invalid-uuid"
   - "123"
4. For each invalid ID combination, call create instance API endpoint
5. Verify UUID validation fails
6. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid project ID" or "Invalid database type ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid project IDs: ["invalid-uuid", "123"]
- Invalid database type IDs: ["invalid-uuid", "123"]

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made

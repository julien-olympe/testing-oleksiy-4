# Create Database Instance Unit Test Specification

## Test File: `create-database-instance.test.ts`

### Purpose
Test the create database instance functionality, including successful creation, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/databases/:databaseId/instances` endpoint
- Create database instance service/function
- Project access verification
- Database schema validation
- Instance limit verification (10000 instances per database)

### Test Cases

#### Test Case 1: Successful Create Database Instance
**Test Name**: `should create database instance with string property value when user has project access`

**Description**: Verifies that users with project access can create database instances.

**Setup**:
- Mock authentication middleware
- Mock database queries for project access and database schema
- Mock database INSERT for instance

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid', databaseId: 'database-uuid' }
Body: { data_values: { string_prop: "Hello World" } }
```

**Actions**:
1. Verify project access
2. Verify database exists in project
3. Validate data_values match schema_definition
4. Create database instance
5. Return created instance

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body: `{ id: "instance-uuid", database_id: "database-uuid", data_values: { string_prop: "Hello World" }, ... }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO database_instances'),
  expect.arrayContaining([
    'database-uuid',
    expect.objectContaining({ string_prop: 'Hello World' })
  ])
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: Missing auth, no project access, database not found, invalid data_values, instance limit reached, database errors

---

#### Test Case 2: Create Instance When Limit Reached
**Test Name**: `should return error when database has reached maximum instance limit (10000 instances)`

**Expected Outputs**: HTTP 400, `{ error: "Maximum instance limit reached (10000 instances)" }`

#### Test Case 3: Create Instance with Invalid Data Values
**Test Name**: `should return error when data_values do not match schema definition`

**Expected Outputs**: HTTP 400, `{ error: "Invalid data values" }`

#### Test Case 4: Create Instance with Missing Required Property
**Test Name**: `should return error when required property is missing from data_values`

**Expected Outputs**: HTTP 400, `{ error: "Required property 'string_prop' is missing" }`

#### Test Case 5: Create Instance with Empty String Property
**Test Name**: `should create instance when string property is empty string`

**Description**: Empty strings are valid values.

**Expected Outputs**: HTTP 201, instance created with empty string

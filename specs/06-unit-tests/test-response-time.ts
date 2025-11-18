# API Response Time Unit Test Specification

## Test File: `response-time.test.ts`

### Purpose
Test that all API endpoints respond within 200ms under normal load, as specified in performance requirements.

### Functions/APIs Being Tested
- All API endpoints
- Response time measurement
- Performance validation

### Test Cases

#### Test Case 1: Authentication Endpoints Response Time
**Test Name**: `should respond within 200ms for login and registration endpoints`

**Description**: Verifies that authentication endpoints meet the 200ms response time requirement.

**Setup**:
- Mock database queries (fast responses)
- Mock bcrypt operations (fast hashing/comparison)
- Mock JWT operations (fast token generation)

**Inputs**:
```typescript
// Login request
POST /api/auth/login
Body: { email: 'user@example.com', password: 'password123' }

// Registration request
POST /api/auth/register
Body: { email: 'newuser@example.com', password: 'password123' }
```

**Actions**:
1. Execute login request
2. Measure response time
3. Execute registration request
4. Measure response time
5. Verify both complete within 200ms

**Expected Outputs**:
- Login response time < 200ms
- Registration response time < 200ms

**Assertions**:
```typescript
const loginStart = Date.now();
const loginResponse = await loginUser('user@example.com', 'password123');
const loginTime = Date.now() - loginStart;
expect(loginTime).toBeLessThan(200);

const registerStart = Date.now();
const registerResponse = await registerUser('newuser@example.com', 'password123');
const registerTime = Date.now() - registerStart;
expect(registerTime).toBeLessThan(200);
```

**Error Conditions**: Response time exceeds 200ms

---

#### Test Case 2: Project CRUD Operations Response Time
**Test Name**: `should respond within 200ms for all project CRUD operations`

**Description**: Verifies that project create, read, update, delete operations meet the 200ms requirement.

**Setup**:
- Mock database queries
- Mock authentication

**Inputs**:
```typescript
// Create project
POST /api/projects
Body: {}

// View projects
GET /api/projects

// Rename project
PUT /api/projects/:projectId
Body: { name: 'New Name' }

// Delete project
DELETE /api/projects/:projectId
```

**Actions**:
1. Execute each CRUD operation
2. Measure response time for each
3. Verify all complete within 200ms

**Expected Outputs**:
- Create project response time < 200ms
- View projects response time < 200ms
- Rename project response time < 200ms
- Delete project response time < 200ms

**Assertions**:
```typescript
const operations = [
  { name: 'create', fn: () => createProject() },
  { name: 'view', fn: () => viewProjects() },
  { name: 'rename', fn: () => renameProject('project-uuid', 'New Name') },
  { name: 'delete', fn: () => deleteProject('project-uuid') }
];

for (const op of operations) {
  const start = Date.now();
  await op.fn();
  const time = Date.now() - start;
  expect(time).toBeLessThan(200);
}
```

**Error Conditions**: Any operation exceeds 200ms

---

#### Test Case 3: Function CRUD Operations Response Time
**Test Name**: `should respond within 200ms for all function CRUD operations`

**Description**: Verifies that function create, read, update, delete operations meet the 200ms requirement.

**Setup**:
- Mock database queries
- Mock authentication

**Inputs**:
```typescript
// Create function
POST /api/projects/:projectId/functions
Body: {}

// View functions (via open project)
GET /api/projects/:projectId

// Rename function
PUT /api/projects/:projectId/functions/:functionId
Body: { name: 'New Function Name' }

// Delete function
DELETE /api/projects/:projectId/functions/:functionId
```

**Actions**:
1. Execute each CRUD operation
2. Measure response time for each
3. Verify all complete within 200ms

**Expected Outputs**:
- All function CRUD operations complete within 200ms

**Assertions**:
```typescript
// Similar to project CRUD assertions
expect(functionCreateTime).toBeLessThan(200);
expect(functionViewTime).toBeLessThan(200);
expect(functionRenameTime).toBeLessThan(200);
expect(functionDeleteTime).toBeLessThan(200);
```

**Error Conditions**: Any operation exceeds 200ms

---

#### Test Case 4: Database Instance Query Response Time
**Test Name**: `should respond within 200ms for database instance queries with pagination`

**Description**: Verifies that database instance queries meet the 200ms requirement even with pagination.

**Setup**:
- Mock database queries with pagination (LIMIT/OFFSET)
- Mock large dataset (10000 instances)

**Inputs**:
```typescript
GET /api/projects/:projectId/databases/:databaseId/instances?page=1&limit=100
```

**Actions**:
1. Execute instance query with pagination
2. Measure response time
3. Verify completion within 200ms

**Expected Outputs**:
- Instance query response time < 200ms
- Pagination works correctly

**Assertions**:
```typescript
const start = Date.now();
const response = await queryInstances('database-uuid', { page: 1, limit: 100 });
const time = Date.now() - start;
expect(time).toBeLessThan(200);
expect(response.instances.length).toBeLessThanOrEqual(100);
```

**Error Conditions**: Query time exceeds 200ms

---

#### Test Case 5: Function Execution Response Time
**Test Name**: `should execute function within 1000ms for functions with up to 100 bricks`

**Description**: Verifies that function execution meets the 1000ms requirement (different from API response time).

**Setup**:
- Mock function with 100 bricks
- Mock brick execution logic
- Mock database queries

**Inputs**:
```typescript
POST /api/projects/:projectId/functions/:functionId/execute
Body: {}
```

**Actions**:
1. Execute function with 100 bricks
2. Measure execution time
3. Verify completion within 1000ms

**Expected Outputs**:
- Function execution time < 1000ms
- Console output generated

**Assertions**:
```typescript
const start = Date.now();
const response = await executeFunction('function-uuid');
const time = Date.now() - start;
expect(time).toBeLessThan(1000);
expect(response.console_output).toBeDefined();
```

**Error Conditions**: Execution time exceeds 1000ms

---

#### Test Case 6: Page Load Performance
**Test Name**: `should load pages within 2 seconds including data fetching`

**Description**: Verifies that page loads (Home Screen, Project Editor, Function Editor) meet the 2 second requirement.

**Setup**:
- Mock all API endpoints
- Mock React rendering

**Inputs**:
```typescript
// Home Screen load
GET /api/projects

// Project Editor load
GET /api/projects/:projectId

// Function Editor load
GET /api/projects/:projectId/functions/:functionId
```

**Actions**:
1. Load each page
2. Measure total load time (API + rendering)
3. Verify all complete within 2 seconds

**Expected Outputs**:
- Home Screen load time < 2000ms
- Project Editor load time < 2000ms
- Function Editor load time < 2000ms

**Assertions**:
```typescript
const pages = [
  { name: 'Home Screen', fn: () => loadHomeScreen() },
  { name: 'Project Editor', fn: () => loadProjectEditor('project-uuid') },
  { name: 'Function Editor', fn: () => loadFunctionEditor('function-uuid') }
];

for (const page of pages) {
  const start = Date.now();
  await page.fn();
  const time = Date.now() - start;
  expect(time).toBeLessThan(2000);
}
```

**Error Conditions**: Any page load exceeds 2000ms

---

### Performance Requirements Summary
- All API endpoints: < 200ms
- Authentication endpoints: < 200ms
- Project CRUD operations: < 200ms
- Function CRUD operations: < 200ms
- Database instance queries: < 200ms (with pagination)
- Function execution: < 1000ms (for functions with 100 bricks)
- Page loads: < 2 seconds (including data fetching and rendering)

### Notes
- These tests should use mocked database operations to ensure consistent timing
- Actual integration tests may show different performance characteristics
- Consider using performance profiling tools for detailed analysis

# End-to-End Testing Rules

## Test Environment Setup

### Browser Automation Framework
- **Framework**: Playwright
- **Supported Browsers**: Chromium, Firefox, WebKit (all modern browsers)
- **Default Browser**: Chromium
- **Headless Mode**: Enabled by default for CI/CD, can be disabled for debugging
- **Viewport Size**: Minimum 1280x720 pixels (as per system requirements)
- **Timeout Settings**:
  - Navigation timeout: 30 seconds
  - Action timeout: 10 seconds
  - Assertion timeout: 5 seconds

### Test Environment Configuration
- **Base URL**: Configured via environment variable `BASE_URL` (default: `http://localhost:3000`)
- **API Base URL**: Configured via environment variable `API_BASE_URL` (default: `http://localhost:3001`)
- **Database**: PostgreSQL test database (separate from development database)
- **Test Data Isolation**: Each test suite should use isolated test data
- **Cleanup**: Database cleanup between test runs (truncate tables or use transactions)

### Test Execution
- **Test Runner**: Jest with Playwright test runner
- **Parallel Execution**: Tests can run in parallel, but must not share state
- **Test Isolation**: Each test must be independent and not rely on other tests
- **Test Order**: Tests should be executable in any order

## Authentication Handling

### Session Management
- **Authentication Method**: JWT tokens stored in HTTP-only cookies or localStorage
- **Token Expiration**: 24 hours (as per technical specifications)
- **Session Persistence**: Use Playwright's context storage state to persist sessions between tests
- **Login Helper**: Create reusable login helper function that:
  - Accepts email and password as parameters
  - Navigates to login screen
  - Fills login form
  - Submits form
  - Waits for navigation to Home Screen
  - Returns authentication context state

### Authentication Test Patterns
- **Before Each Test**: Clear all cookies and localStorage before each test
- **Authentication Setup**: Use `beforeAll` or `beforeEach` hooks to set up authenticated sessions when needed
- **Session State**: Save authenticated session state using `context.storageState()` for reuse
- **Logout**: Always logout after tests that require authentication (use `afterEach` hooks)

### Test User Management
- **Test Users**: Create dedicated test users with predictable credentials
- **User Cleanup**: Clean up test users after test execution
- **User Isolation**: Verify that users only see their own projects (user isolation enforcement)

## Test Data Management

### Test Data Creation
- **Factory Pattern**: Use test data factories to create consistent test data
- **Database Seeding**: Seed database with required test data before test execution
- **Test Data Naming**: Use predictable naming patterns (e.g., `test-user-{timestamp}`, `test-project-{uuid}`)
- **Unique Identifiers**: Use UUIDs or timestamps to ensure unique test data

### Test Data Cleanup
- **After Each Test**: Clean up test-specific data created during test execution
- **After All Tests**: Clean up all test data after test suite completion
- **Database Transactions**: Use database transactions that rollback after tests when possible
- **Cascade Deletes**: Ensure proper cleanup of related data (projects, functions, permissions, instances)

### Test Data Patterns
- **Default Test User**: Create a default authenticated test user for most tests
- **Multiple Users**: Create multiple test users for permission and collaboration tests
- **Project Data**: Create test projects with predictable names and structures
- **Database Instances**: Create test database instances with known string property values

## Assertion Patterns

### UI Element Assertions
- **Visibility**: Use `expect(element).toBeVisible()` to verify elements are displayed
- **Text Content**: Use `expect(element).toHaveText()` to verify text content matches expected values
- **Element Count**: Use `expect(elements).toHaveCount()` to verify number of elements
- **Element State**: Use `expect(element).toBeEnabled()` or `expect(element).toBeDisabled()` for form controls

### Navigation Assertions
- **URL Verification**: Use `expect(page).toHaveURL()` to verify correct screen navigation
- **Page Title**: Use `expect(page).toHaveTitle()` if page titles are implemented
- **Screen Elements**: Verify presence of screen-specific elements to confirm navigation

### Data Assertions
- **List Contents**: Verify list items contain expected data (project names, function names, user emails)
- **Form Values**: Verify form inputs contain expected values after data entry
- **Database State**: Verify database state matches UI state (for critical operations)

### Error Message Assertions
- **Error Visibility**: Verify error messages are displayed when expected
- **Error Text**: Verify error message text matches specification exactly
- **Error Dismissal**: Verify errors can be dismissed or disappear after correction

## Error Handling in Tests

### Expected Errors
- **Negative Test Cases**: Explicitly test error scenarios and verify error messages
- **Error Message Validation**: Verify error messages match specifications exactly
- **Error State Recovery**: Verify system recovers gracefully from error states

### Unexpected Errors
- **Test Failure Handling**: Capture screenshots on test failure
- **Error Logging**: Log detailed error information including:
  - Test name and description
  - Failed assertion or error message
  - Page URL and state
  - Screenshot path
- **Debugging**: Provide clear error messages that help identify the cause of failure

### Timeout Handling
- **Action Timeouts**: Set appropriate timeouts for slow operations (database queries, API calls)
- **Wait Strategies**: Use explicit waits (`waitForSelector`, `waitForNavigation`) instead of fixed delays
- **Timeout Errors**: Provide meaningful timeout error messages

## Browser Automation Patterns

### Element Selection
- **Selectors**: Prefer data-testid attributes for element selection
- **Fallback Selectors**: Use CSS selectors, text content, or role-based selectors as fallback
- **Selector Strategy**: Use most stable selectors (avoid brittle selectors like nth-child when possible)
- **Selector Examples**:
  - `page.getByTestId('login-email-input')`
  - `page.getByRole('button', { name: 'Login' })`
  - `page.locator('input[type="email"]')`

### User Interactions
- **Click Actions**: Use `page.click()` or `element.click()` for button clicks
- **Double-Click**: Use `page.dblclick()` for opening projects and functions
- **Fill Inputs**: Use `page.fill()` or `element.fill()` for text input
- **Select Options**: Use `page.selectOption()` for dropdown selections
- **Drag and Drop**: Use `page.dragAndDrop()` for drag-and-drop operations
- **Keyboard Input**: Use `page.keyboard.press()` for keyboard shortcuts if needed

### Wait Strategies
- **Navigation Waits**: Use `page.waitForNavigation()` after actions that trigger navigation
- **Element Waits**: Use `page.waitForSelector()` to wait for elements to appear
- **Network Waits**: Use `page.waitForResponse()` for API calls when needed
- **Avoid Fixed Delays**: Never use `page.waitForTimeout()` unless absolutely necessary

### Drag and Drop Patterns
- **Brick Dragging**: Drag bricks from brick list to target areas
- **Connection Dragging**: Drag from output port to input port to create connections
- **Drop Validation**: Verify drop location is valid before dropping
- **Visual Feedback**: Verify visual feedback during drag operations

## Common Utilities and Helpers

### Navigation Helpers
- **Navigate to Login**: `async navigateToLogin()`
- **Navigate to Home**: `async navigateToHome()`
- **Navigate to Project Editor**: `async navigateToProjectEditor(projectName: string)`
- **Navigate to Function Editor**: `async navigateToFunctionEditor(projectName: string, functionName: string)`

### Authentication Helpers
- **Login**: `async login(email: string, password: string)`
- **Register**: `async register(email: string, password: string)`
- **Logout**: `async logout()`
- **Get Authenticated Context**: `async getAuthenticatedContext(email: string, password: string)`

### Data Creation Helpers
- **Create Test User**: `async createTestUser(email: string, password: string)`
- **Create Test Project**: `async createTestProject(projectName: string, userId: string)`
- **Create Test Function**: `async createTestFunction(functionName: string, projectId: string)`
- **Create Database Instance**: `async createDatabaseInstance(databaseName: string, stringValue: string, projectId: string)`

### Assertion Helpers
- **Assert Project Visible**: `async assertProjectVisible(projectName: string)`
- **Assert Function Visible**: `async assertFunctionVisible(functionName: string)`
- **Assert Error Message**: `async assertErrorMessage(expectedMessage: string)`
- **Assert Console Output**: `async assertConsoleOutput(expectedContent: string)`

### Cleanup Helpers
- **Cleanup Test User**: `async cleanupTestUser(email: string)`
- **Cleanup Test Project**: `async cleanupTestProject(projectId: string)`
- **Cleanup All Test Data**: `async cleanupAllTestData()`

## Test Structure Standards

### Test File Organization
- **File Naming**: Use kebab-case: `test-scenario-name.md`
- **Test Sections**: Each test file must include:
  1. Test Name
  2. Description
  3. Prerequisites
  4. Test Steps (detailed with exact UI interactions)
  5. Expected Results
  6. Assertions
  7. Error Scenarios (for negative tests)

### Test Step Format
- **Numbered Steps**: Use numbered steps (1, 2, 3, ...)
- **Action Format**: Use imperative mood ("Click the Login button", "Enter email address")
- **Element Identification**: Specify exact element to interact with
- **Expected State**: Include expected UI state after each step
- **Wait Conditions**: Specify what to wait for after each action

### Assertion Format
- **Explicit Assertions**: Every test step that changes state should have an assertion
- **Assertion Location**: Place assertions immediately after the action that triggers the state change
- **Assertion Specificity**: Be specific about what is being asserted (element visibility, text content, URL, etc.)

## Best Practices

### Test Maintainability
- **DRY Principle**: Reuse helper functions and utilities
- **Page Object Model**: Consider using Page Object Model pattern for complex screens
- **Test Data**: Externalize test data to configuration files when appropriate
- **Comments**: Add comments for complex test logic or non-obvious steps

### Test Reliability
- **Flaky Tests**: Avoid flaky tests by using proper wait strategies
- **Race Conditions**: Handle race conditions with explicit waits
- **Timing Issues**: Account for network latency and rendering delays
- **Browser Differences**: Test on multiple browsers if browser-specific issues are suspected

### Test Coverage
- **Happy Paths**: Test all successful user flows
- **Error Cases**: Test all error scenarios and edge cases
- **Boundary Conditions**: Test boundary values (empty strings, maximum lengths, etc.)
- **User Permissions**: Test permission-based access control

### Test Documentation
- **Clear Descriptions**: Write clear, descriptive test names and descriptions
- **Step Clarity**: Make test steps unambiguous and implementable
- **Expected Results**: Clearly specify expected outcomes
- **Prerequisites**: List all prerequisites clearly

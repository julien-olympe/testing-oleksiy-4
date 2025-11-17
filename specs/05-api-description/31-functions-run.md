# POST /api/v1/functions/:id/run

## Endpoint
`POST /api/v1/functions/:id/run`

## Description
Executes a function by running the assembled brick logic. The function is validated before execution (required inputs configured, valid connections). The user must own the project containing the function or have permission to execute it. Execution results are returned in the response.

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Path Parameters
- **id**: Function UUID
  - Type: UUID
  - Required: Yes
  - Example: "770e8400-e29b-41d4-a716-446655440002"

### Body
Empty body (no request body required)

## Response Schema

### Success Response (200 OK)
```json
{
  "execution": {
    "functionId": "uuid",
    "status": "success",
    "duration": 150,
    "results": [
      {
        "brickId": "uuid",
        "brickType": "string",
        "output": {}
      }
    ],
    "consoleOutput": [
      "string"
    ]
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Inputs
```json
{
  "error": {
    "code": "MISSING_REQUIRED_INPUTS",
    "message": "Missing required inputs",
    "details": {
      "brickId": "uuid",
      "brickType": "string",
      "missingInputs": ["string"]
    }
  }
}
```

#### 400 Bad Request - Invalid Brick Connections
```json
{
  "error": {
    "code": "INVALID_BRICK_CONNECTIONS",
    "message": "Invalid brick connections",
    "details": {
      "issues": [
        "string"
      ]
    }
  }
}
```

#### 400 Bad Request - Execution Failed
```json
{
  "error": {
    "code": "EXECUTION_FAILED",
    "message": "Execution failed",
    "details": {
      "brickId": "uuid",
      "brickType": "string",
      "error": "string"
    }
  }
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

#### 403 Forbidden - Permission Denied
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to run this function",
    "details": {}
  }
}
```

#### 404 Not Found - Function Not Found
```json
{
  "error": {
    "code": "FUNCTION_NOT_FOUND",
    "message": "Function not found",
    "details": {}
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "details": {}
  }
}
```

## Status Codes
- **200 OK**: Function executed successfully
- **400 Bad Request**: Validation error or execution failure
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to run function
- **404 Not Found**: Function does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate function ID is valid UUID
4. Query function from database by ID
5. If function not found, return 404
6. Query project for function
7. Check if user is project owner OR has permission
8. If user lacks access, return 403
9. Query all bricks for function
10. Query all connections for bricks
11. Validate function structure:
    - All required brick inputs are configured (e.g., database name for ListInstancesByDB)
    - All brick connections are valid (outputs connected to inputs)
    - No circular dependencies
12. If validation fails, return 400 with specific error
13. Execute function logic:
    - Build execution graph from connections
    - Execute bricks in topological order
    - For each brick:
      - ListInstancesByDB: Query database instances by name
      - GetFirstInstance: Extract first instance from list
      - LogInstanceProps: Format instance properties for console output
    - Pass data between bricks via connections
14. Collect execution results and console output
15. Return execution results

## Authorization Rules
- User must be authenticated
- User must own project containing function OR have project permission
- Permission check performed before execution

## Request Example
```json
POST /api/v1/functions/770e8400-e29b-41d4-a716-446655440002/run
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "execution": {
    "functionId": "770e8400-e29b-41d4-a716-446655440002",
    "status": "success",
    "duration": 150,
    "results": [
      {
        "brickId": "cc0e8400-e29b-41d4-a716-446655440007",
        "brickType": "ListInstancesByDB",
        "output": {
          "list": [
            {
              "id": "bb0e8400-e29b-41d4-a716-446655440006",
              "values": {
                "string": "First Instance Value"
              }
            }
          ]
        }
      },
      {
        "brickId": "dd0e8400-e29b-41d4-a716-446655440008",
        "brickType": "GetFirstInstance",
        "output": {
          "instance": {
            "id": "bb0e8400-e29b-41d4-a716-446655440006",
            "values": {
              "string": "First Instance Value"
            }
          }
        }
      },
      {
        "brickId": "ee0e8400-e29b-41d4-a716-446655440009",
        "brickType": "LogInstanceProps",
        "output": {
          "value": "Logged to console"
        }
      }
    ],
    "consoleOutput": [
      "Instance properties: { id: 'bb0e8400-e29b-41d4-a716-446655440006', string: 'First Instance Value' }"
    ]
  }
}
```

## Response Example (Error - Missing Required Inputs)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "MISSING_REQUIRED_INPUTS",
    "message": "Missing required inputs",
    "details": {
      "brickId": "cc0e8400-e29b-41d4-a716-446655440007",
      "brickType": "ListInstancesByDB",
      "missingInputs": ["databaseName"]
    }
  }
}
```

## Response Example (Error - Execution Failed)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "EXECUTION_FAILED",
    "message": "Execution failed",
    "details": {
      "brickId": "dd0e8400-e29b-41d4-a716-446655440008",
      "brickType": "GetFirstInstance",
      "error": "List is empty, cannot get first instance"
    }
  }
}
```

## Related Use Cases
- Run Function (from 03-functional-requirements.md)

## Notes
- Function validation occurs before execution
- Execution timeout: 2 seconds maximum
- Results include output from each brick in execution order
- Console output is formatted for display in browser console
- Execution is logged for audit purposes
- Response time should be < 2000ms (function execution performance requirement)
- This endpoint is called when user clicks RUN button
- All external dependencies must be abstracted for testability

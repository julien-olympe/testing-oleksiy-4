# PUT /api/v1/projects/:id/databases/:databaseId/instances/:instanceId

## Endpoint
`PUT /api/v1/projects/:id/databases/:databaseId/instances/:instanceId`

## Description
Updates a property value for a database instance. The user must own the project or have permission to modify it. This endpoint is called automatically when a user inputs or modifies a property value (auto-save with 500ms debounce).

## Authentication
Required (JWT token in Authorization header)

## Request Schema

### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

### Path Parameters
- **id**: Project UUID
  - Type: UUID
  - Required: Yes
  - Example: "550e8400-e29b-41d4-a716-446655440000"

- **databaseId**: Database UUID
  - Type: UUID
  - Required: Yes
  - Example: "990e8400-e29b-41d4-a716-446655440004"

- **instanceId**: Instance UUID
  - Type: UUID
  - Required: Yes
  - Example: "bb0e8400-e29b-41d4-a716-446655440006"

### Body
```json
{
  "propertyId": "uuid (required)",
  "value": "string (required)"
}
```

### Field Validation
- **propertyId**: 
  - Required: Yes
  - Type: UUID
  - Example: "aa0e8400-e29b-41d4-a716-446655440005"

- **value**: 
  - Required: Yes
  - Type: String
  - Max length: 10000 characters
  - Example: "Instance Property Value"

## Response Schema

### Success Response (200 OK)
```json
{
  "instance": {
    "id": "uuid",
    "databaseId": "uuid",
    "values": [
      {
        "propertyId": "uuid",
        "propertyName": "string",
        "value": "string"
      }
    ],
    "updatedAt": "iso8601-timestamp"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Property Value
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid property value",
    "details": {
      "field": "value",
      "validationErrors": [
        {
          "field": "value",
          "message": "Property value exceeds maximum length"
        }
      ]
    }
  }
}
```

#### 400 Bad Request - Required Field Missing
```json
{
  "error": {
    "code": "REQUIRED_FIELD_MISSING",
    "message": "Required field is missing",
    "details": {
      "field": "propertyId",
      "validationErrors": [
        {
          "field": "propertyId",
          "message": "Property ID is required"
        }
      ]
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
    "message": "You don't have permission to modify instances in this project",
    "details": {}
  }
}
```

#### 404 Not Found - Project Not Found
```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found",
    "details": {}
  }
}
```

#### 404 Not Found - Instance Not Found
```json
{
  "error": {
    "code": "INSTANCE_NOT_FOUND",
    "message": "Instance not found",
    "details": {}
  }
}
```

#### 404 Not Found - Property Not Found
```json
{
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "Property not found",
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
- **200 OK**: Instance updated successfully
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: User lacks permission to modify instances
- **404 Not Found**: Project, instance, or property does not exist
- **500 Internal Server Error**: Server-side error

## Business Logic
1. Validate JWT token from Authorization header
2. Extract user ID from token
3. Validate project ID is valid UUID
4. Validate database ID is valid UUID
5. Validate instance ID is valid UUID
6. Validate property ID is valid UUID
7. Validate property value (required, max length)
8. Query project from database by ID
9. If project not found, return 404
10. Check if user is owner OR has permission
11. If user lacks access, return 403
12. Query instance from database by ID
13. If instance not found, return 404
14. Verify instance belongs to database
15. Query property from database by ID
16. If property not found, return 404
17. Verify property belongs to database
18. Update instance value record (instance_id, property_id)
19. Update instance updated_at timestamp
20. Return updated instance with all values

## Authorization Rules
- User must be authenticated
- User must own project OR have project permission
- Permission check performed before update

## Request Example
```json
PUT /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/databases/990e8400-e29b-41d4-a716-446655440004/instances/bb0e8400-e29b-41d4-a716-446655440006
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "propertyId": "aa0e8400-e29b-41d4-a716-446655440005",
  "value": "Instance Property Value"
}
```

## Response Example (Success)
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "instance": {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "databaseId": "990e8400-e29b-41d4-a716-446655440004",
    "values": [
      {
        "propertyId": "aa0e8400-e29b-41d4-a716-446655440005",
        "propertyName": "string",
        "value": "Instance Property Value"
      }
    ],
    "updatedAt": "2024-01-15T12:10:00.000Z"
  }
}
```

## Related Use Cases
- Edit Database Instance Property (from 03-functional-requirements.md)

## Notes
- Only one property value is updated per request
- Value is automatically persisted (auto-save)
- Updated timestamp is automatically set
- All property values are returned in response
- Response time should be < 250ms (PUT request performance requirement)
- This endpoint is called automatically when user inputs value (debounced)

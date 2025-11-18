# Performance Requirements

## Maximum Number of Terminals

- Maximum number of terminals: N/A - This is a web application accessed through web browsers. There is no concept of physical terminals. The system supports concurrent browser sessions as specified in the Concurrent Users section (1000 concurrent users).

## User Capacity

### Concurrent Users
- Maximum number of simultaneous users: 1000 concurrent users
- Each user can maintain an active session with authentication token
- Session management uses JWT tokens stored client-side (no server-side session storage)

### Simultaneous Transactions
- Maximum number of simultaneous transactions per user: 100 transactions
- A transaction is defined as any API request that modifies or retrieves data
- Read operations (GET requests) are not counted as transactions
- Write operations (POST, PUT, DELETE) count as transactions

## Data Capacity

### Projects per User
- Maximum number of projects per user: 1000 projects
- Includes both owned projects and projects shared via permissions
- Project list queries must paginate when exceeding 50 projects per page

### Functions per Project
- Maximum number of functions per project: 500 functions
- Function list queries must paginate when exceeding 50 functions per page
- Function execution performance is independent of total function count

### Bricks per Function
- Maximum number of bricks per function: 100 bricks
- Includes all brick types (ListInstancesByDBName, GetFirstInstance, LogInstanceProps, and future brick types)
- Brick connection graph must validate within 1 second for functions with maximum brick count

### Database Instances per Database
- Maximum number of database instances per database schema: 10000 instances
- Instance queries must support pagination (default 100 instances per page)
- Instance creation must complete within 200ms regardless of total instance count

## Response Time Requirements

### API Endpoints
- All API endpoints must respond within 200ms under normal load
- Authentication endpoints (login, register): < 200ms
- Project CRUD operations: < 200ms
- Function CRUD operations: < 200ms
- Database instance queries: < 200ms (with pagination)
- Function execution: < 1000ms (see brick execution requirements)

### Page Load Performance
- Initial page load (Home Screen): < 2 seconds
- Project Editor load: < 2 seconds
- Function Editor load: < 2 seconds
- Includes all required data fetching and React component rendering

### Brick Execution Performance
- Individual brick execution: < 1 second per brick
- Complete function execution (all connected bricks): < 5 seconds for functions with 100 bricks
- Execution time measured from RUN button click to console output completion
- Database queries within bricks must complete within 500ms

## File Size Constraints

### Data Storage
- No file uploads are supported in the application
- All data is stored in PostgreSQL database
- JSONB columns (schema_definition, data_values, configuration) have no explicit size limit but must remain under PostgreSQL's JSONB size limits (approximately 1GB per value)
- Database instance data_values must not exceed 10MB per instance

### Client-Side Assets
- JavaScript bundle size: < 2MB (gzipped)
- CSS bundle size: < 200KB (gzipped)
- Initial HTML load: < 50KB

## Real-Time Constraints

### Processing Model
- No real-time processing is required
- Application uses standard HTTP request-response pattern
- All operations are synchronous from user perspective
- Function execution runs synchronously on the server (blocking execution)

### WebSocket Requirements
- WebSockets are not required
- No server-sent events (SSE) are needed
- No live collaboration features are implemented

## Database Performance

### Query Optimization
- All list queries (projects, functions, instances) must use database indexes
- Foreign key relationships must have indexes on foreign key columns
- Complex queries (permission checks, brick connections) must execute within 50ms

### Connection Pooling
- PostgreSQL connection pool size: 20 connections
- Connection pool timeout: 30 seconds
- Maximum query execution time: 5 seconds before timeout

## Caching Requirements

### Client-Side Caching
- Project list cached in React state (refreshed on navigation)
- Function data cached during editing session
- No persistent client-side caching (localStorage/sessionStorage) for data

### Server-Side Caching
- No server-side caching is required
- All data is fetched fresh from database on each request
- Authentication tokens validated on every protected endpoint request

## Scalability Considerations

### Horizontal Scaling
- Application must support horizontal scaling (multiple server instances)
- Stateless API design (no server-side session storage)
- Database connection pooling per server instance

### Load Distribution
- API endpoints must handle 1000 concurrent users across multiple server instances
- Database must handle concurrent queries from all server instances
- No single point of failure in request handling

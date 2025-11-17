# Visual Programming Backend API

Backend API server for the visual programming application built with Fastify 4.26.2 and TypeScript 5.5.4.

## Features

- Fastify 4.26.2 with TypeScript 5.5.4 (strict mode)
- Prisma ORM with PostgreSQL 16.x
- JWT authentication (HS256, 24h access tokens, 7d refresh tokens)
- Token blacklist for logout
- Structured JSON logging with request ID tracking
- Standardized error handling
- Input validation
- Transaction management (30s timeout)
- Row-level security
- Password hashing (bcrypt cost 12)
- CORS configuration
- Security headers
- Rate limiting
- Function execution engine with brick logic
- Topological ordering for brick execution
- Default database initialization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/me` - Get current user profile

### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/editor` - Get project editor data

### Functions
- `GET /projects/:id/functions` - List functions
- `POST /projects/:id/functions` - Create function
- `GET /functions/:id` - Get function
- `PUT /functions/:id` - Update function
- `DELETE /functions/:id` - Delete function
- `GET /functions/:id/editor` - Get function editor data
- `POST /functions/:id/run` - Run function

### Permissions
- `GET /projects/:id/permissions` - List permissions
- `POST /projects/:id/permissions` - Add permission
- `DELETE /projects/:id/permissions/:userId` - Remove permission

### Databases
- `GET /projects/:id/databases` - List databases
- `GET /projects/:id/databases/:databaseId/instances` - List instances
- `POST /projects/:id/databases/:databaseId/instances` - Create instance
- `PUT /projects/:id/databases/:databaseId/instances/:instanceId` - Update instance
- `DELETE /projects/:id/databases/:databaseId/instances/:instanceId` - Delete instance

### Bricks
- `POST /functions/:id/bricks` - Create brick
- `PUT /bricks/:id` - Update brick
- `DELETE /bricks/:id` - Delete brick
- `POST /bricks/:id/connections` - Create connection
- `DELETE /bricks/:id/connections/:connectionId` - Delete connection

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

The codebase is organized into:
- `src/config/` - Configuration files
- `src/db/` - Database client and initialization
- `src/middleware/` - Request middleware (auth, logging, error handling)
- `src/routes/` - API route handlers
- `src/utils/` - Utility functions (auth, validation, execution engine)

# Visual Programming Application

A visual programming application that enables users to create programming logic through visual elements called "bricks" that can be connected together to form executable functions.

## Prerequisites

- Docker 24.x or later
- Docker Compose 2.x or later
- Node.js 20.x LTS (for local development without Docker)
- npm 10.x or later

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository** (if applicable) or navigate to the project directory.

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file and update the values as needed, especially:
   - `JWT_SECRET`: Generate a secure random string (minimum 256 bits)
   - `JWT_REFRESH_SECRET`: Generate a secure random string (minimum 256 bits)
   - Database credentials if different from defaults

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```
   This will start:
   - PostgreSQL 16.x database on port 5432
   - Backend API server on port 3000
   - Frontend development server on port 5173

4. **Check service health:**
   ```bash
   docker-compose ps
   ```
   All services should show as "healthy" after a few moments.

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1
   - Database: localhost:5432

6. **View logs:**
   ```bash
   docker-compose logs -f
   ```
   Or view logs for a specific service:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres
   ```

7. **Stop all services:**
   ```bash
   docker-compose down
   ```
   To also remove volumes (database data):
   ```bash
   docker-compose down -v
   ```

## Local Development (Without Docker)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/visual_programming?schema=public
   JWT_SECRET=your-secret-key-change-in-production
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

4. **Set up database:**
   ```bash
   # Database migrations should be run manually or via your migration tool
   # The application uses raw SQL queries with the pg (node-postgres) library
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── backend/              # Backend API server
│   ├── src/             # TypeScript source files
│   ├── dist/            # Compiled JavaScript (generated)
│   ├── Dockerfile       # Backend container definition
│   ├── .dockerignore    # Docker ignore patterns
│   ├── package.json     # Backend dependencies
│   ├── tsconfig.json    # TypeScript configuration
│   ├── .eslintrc.json   # ESLint configuration
│   └── .prettierrc.json # Prettier configuration
├── frontend/            # Frontend React application
│   ├── src/             # React source files
│   ├── dist/            # Built assets (generated)
│   ├── Dockerfile       # Frontend container definition
│   ├── .dockerignore    # Docker ignore patterns
│   ├── package.json     # Frontend dependencies
│   ├── tsconfig.json    # TypeScript configuration
│   ├── .eslintrc.json   # ESLint configuration
│   └── .prettierrc.json # Prettier configuration
├── specs/               # Project specifications
├── docker-compose.yml   # Docker Compose configuration
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore patterns
└── README.md            # This file
```

## Available Scripts

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Frontend Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI

## Technology Stack

### Backend
- **Node.js**: 20.x LTS
- **Fastify**: 4.26.2 - High-performance web framework
- **TypeScript**: 5.5.4 - Type-safe JavaScript
- **pg**: 8.11.3 - PostgreSQL client library (node-postgres)
- **PostgreSQL**: 16.x - Primary database
- **Jest**: 29.7.0 - Testing framework
- **nodemon**: 3.1.0 - Development auto-reload

### Frontend
- **React**: 18.3.1 - UI framework
- **TypeScript**: 5.5.4 - Type-safe JavaScript
- **Vite**: 5.2.11 - Build tool and dev server
- **React Flow**: 11.11.4 - Visual node-based editor
- **Jest**: 29.7.0 - Testing framework
- **Playwright**: 1.42.1 - End-to-end testing

### Development Tools
- **ESLint**: 8.x - Code linting (Airbnb TypeScript style guide)
- **Prettier**: 3.x - Code formatting
- **Docker**: 24.x - Containerization

## Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb TypeScript style guide
- **Prettier**: 2 spaces, single quotes, semicolons, trailing commas, 100 char line length
- **Git**: Conventional Commits format

## Health Checks

All containers include health checks:
- **PostgreSQL**: Checks database readiness
- **Backend**: HTTP health check endpoint
- **Frontend**: HTTP health check for dev server

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

- `POSTGRES_USER` - PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD` - PostgreSQL password (default: postgres)
- `POSTGRES_DB` - Database name (default: visual_programming)
- `JWT_SECRET` - Secret key for JWT signing (REQUIRED in production)
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (REQUIRED in production)
- `VITE_API_URL` - Backend API URL for frontend
- `CORS_ORIGIN` - Allowed CORS origin

## Database Setup

The database is automatically initialized when using Docker Compose. For local development:

1. Install PostgreSQL 16.x
2. Create a database:
   ```sql
   CREATE DATABASE visual_programming;
   ```
3. Update `DATABASE_URL` in your `.env` file
4. Run database migrations manually or via your migration tool
   The application uses raw SQL queries with the pg (node-postgres) library

## Troubleshooting

### Port Already in Use

If you get port conflicts, update the ports in `docker-compose.yml` or `.env` file.

### Database Connection Issues

- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database credentials in `.env`
- Verify network connectivity: `docker-compose exec backend ping postgres`

### Build Failures

- Clear Docker cache: `docker-compose build --no-cache`
- Remove node_modules and reinstall: `rm -rf node_modules && npm install`

### Health Check Failures

- Check container logs: `docker-compose logs <service-name>`
- Verify service is listening on expected port
- Ensure dependencies are installed

## Contributing

1. Create a feature branch: `git checkout -b feature/description-name`
2. Make your changes following code standards
3. Run linting and tests: `npm run lint && npm run test`
4. Commit using Conventional Commits format
5. Create a pull request

## License

ISC

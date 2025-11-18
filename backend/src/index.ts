import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { config } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { requestIdMiddleware } from './middleware/request-id';
import { loggingMiddleware, loggingResponseHook } from './middleware/logging';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { projectRoutes } from './routes/projects';
import { functionRoutes } from './routes/functions';
import { permissionRoutes } from './routes/permissions';
import { databaseRoutes } from './routes/databases';
import { brickRoutes } from './routes/bricks';
import { executionRoutes } from './routes/execution';
import { initializeDefaultDatabase } from './db/init';

async function buildServer() {
  const fastify = Fastify({
    logger: false, // We use custom logging
    requestIdLogLabel: 'requestId',
    genReqId: () => {
      return ''; // We handle this in middleware, but need to return a string
    },
  });

  // Register middleware
  fastify.addHook('onRequest', requestIdMiddleware);
  fastify.addHook('onRequest', loggingMiddleware);
  fastify.addHook('onResponse', loggingResponseHook);

  // Register cookie plugin
  await fastify.register(cookie);

  // Register CORS
  await fastify.register(cors, {
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
  });

  // Register rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Security headers
  fastify.addHook('onSend', async (_request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    reply.header('Content-Security-Policy', "default-src 'self'");
  });

  // Health check endpoint for Playwright webServer
  fastify.get('/health', async (_request, reply) => {
    reply.send({ status: 'ok' });
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(userRoutes, { prefix: '/api/v1/users' });
  await fastify.register(projectRoutes, { prefix: '/api/v1/projects' });
  await fastify.register(functionRoutes, { prefix: '/api/v1' });
  await fastify.register(permissionRoutes, { prefix: '/api/v1' });
  await fastify.register(databaseRoutes, { prefix: '/api/v1' });
  await fastify.register(brickRoutes, { prefix: '/api/v1' });
  await fastify.register(executionRoutes, { prefix: '/api/v1' });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  return fastify;
}

async function start() {
  try {
    // Initialize default database
    await initializeDefaultDatabase();

    const server = await buildServer();

    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${config.PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();

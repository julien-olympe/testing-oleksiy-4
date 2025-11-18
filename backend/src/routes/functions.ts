import { FastifyInstance } from 'fastify';
import { query, queryOne, queryMany } from '../db/client';
import { validateUUID } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess } from '../utils/permissions';

interface CreateFunctionBody {
  name?: string;
}

interface UpdateFunctionBody {
  name: string;
}

interface FunctionRow {
  id: string;
  name: string;
  project_id: string;
  created_at: Date;
  updated_at: Date;
}

interface BrickRow {
  id: string;
  function_id: string;
  type: string;
  position_x: number;
  position_y: number;
  configuration: unknown;
  created_at: Date;
  updated_at: Date;
}

interface ConnectionRow {
  id: string;
  from_brick_id: string;
  from_output_name: string;
  to_brick_id: string;
  to_input_name: string;
  created_at: Date;
}

export async function functionRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/projects/:id/functions
  fastify.get(
    '/projects/:projectId/functions',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;

      validateUUID(projectId, 'projectId');

      await checkProjectAccess(userId, projectId);

      const functions = await queryMany<FunctionRow>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );

      reply.send({
        functions: functions.map((f) => ({
          id: f.id,
          name: f.name,
          projectId: f.project_id,
          createdAt: f.created_at.toISOString(),
          updatedAt: f.updated_at.toISOString(),
        })),
      });
    }
  );

  // POST /api/v1/projects/:id/functions
  fastify.post<{ Body: CreateFunctionBody }>(
    '/projects/:projectId/functions',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: CreateFunctionBody }, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const { name } = request.body as CreateFunctionBody;

      validateUUID(projectId, 'projectId');

      const functionName = name || 'New Function';

      if (functionName.length < 1 || functionName.length > 255) {
        throw new ValidationError('Invalid function name', {
          field: 'name',
          validationErrors: [
            {
              field: 'name',
              message: 'Function name must be between 1 and 255 characters',
            },
          ],
        });
      }

      await checkProjectAccess(userId, projectId);

      const functionId = crypto.randomUUID();

      await query(
        'INSERT INTO functions (id, name, project_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [functionId, functionName, projectId]
      );

      const func = await queryOne<FunctionRow>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE id = $1',
        [functionId]
      );

      reply.status(201).send({
        function: {
          id: func!.id,
          name: func!.name,
          projectId: func!.project_id,
          createdAt: func!.created_at.toISOString(),
          updatedAt: func!.updated_at.toISOString(),
        },
      });
    }
  );

  // GET /api/v1/functions/:id
  fastify.get(
    '/functions/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;

      validateUUID(functionId, 'id');

      const func = await queryOne<FunctionRow>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE id = $1',
        [functionId]
      );

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.project_id);

      reply.send({
        function: {
          id: func.id,
          name: func.name,
          projectId: func.project_id,
          createdAt: func.created_at.toISOString(),
          updatedAt: func.updated_at.toISOString(),
        },
      });
    }
  );

  // PUT /api/v1/functions/:id
  fastify.put<{ Body: UpdateFunctionBody }>(
    '/functions/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: UpdateFunctionBody }, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;
      const { name } = request.body as UpdateFunctionBody;

      validateUUID(functionId, 'id');

      if (!name || name.length < 1 || name.length > 255) {
        throw new ValidationError('Invalid function name', {
          field: 'name',
          validationErrors: [
            {
              field: 'name',
              message: 'Function name must be between 1 and 255 characters',
            },
          ],
        });
      }

      const func = await queryOne<FunctionRow>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE id = $1',
        [functionId]
      );

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.project_id);

      await query('UPDATE functions SET name = $1, updated_at = NOW() WHERE id = $2', [
        name,
        functionId,
      ]);

      const updated = await queryOne<FunctionRow>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE id = $1',
        [functionId]
      );

      reply.send({
        function: {
          id: updated!.id,
          name: updated!.name,
          projectId: updated!.project_id,
          createdAt: updated!.created_at.toISOString(),
          updatedAt: updated!.updated_at.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/functions/:id
  fastify.delete(
    '/functions/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;

      validateUUID(functionId, 'id');

      const func = await queryOne<FunctionRow>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE id = $1',
        [functionId]
      );

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.project_id);

      await query('DELETE FROM functions WHERE id = $1', [functionId]);

      reply.send({ message: 'Function deleted successfully' });
    }
  );

  // GET /api/v1/functions/:id/editor
  fastify.get(
    '/functions/:id/editor',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;

      validateUUID(functionId, 'id');

      const func = await queryOne<FunctionRow>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE id = $1',
        [functionId]
      );

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.project_id);

      // Get bricks with connections
      const bricks = await queryMany<BrickRow>(
        'SELECT id, function_id, type, position_x, position_y, configuration, created_at, updated_at FROM bricks WHERE function_id = $1',
        [functionId]
      );

      // Get all connections for these bricks
      const brickIds = bricks.map((b) => b.id);
      const connections = brickIds.length > 0
        ? await queryMany<ConnectionRow>(
            `SELECT id, from_brick_id, from_output_name, to_brick_id, to_input_name, created_at
            FROM brick_connections
            WHERE from_brick_id = ANY($1::uuid[]) OR to_brick_id = ANY($1::uuid[])`,
            [brickIds]
          )
        : [];

      // Organize connections by brick
      const connectionsByBrick = new Map<string, ConnectionRow[]>();
      for (const brick of bricks) {
        connectionsByBrick.set(
          brick.id,
          connections.filter((c) => c.from_brick_id === brick.id || c.to_brick_id === brick.id)
        );
      }

      reply.send({
        function: {
          id: func.id,
          name: func.name,
          projectId: func.project_id,
          createdAt: func.created_at.toISOString(),
          updatedAt: func.updated_at.toISOString(),
        },
        bricks: bricks.map((b) => ({
          id: b.id,
          functionId: b.function_id,
          type: b.type,
          positionX: b.position_x,
          positionY: b.position_y,
          configuration: b.configuration && typeof b.configuration === 'object' ? b.configuration : {},
          createdAt: b.created_at.toISOString(),
          updatedAt: b.updated_at.toISOString(),
        })),
        connections: connections
          .filter((c) => brickIds.includes(c.from_brick_id))
          .map((c) => ({
            id: c.id,
            fromBrickId: c.from_brick_id,
            fromOutputName: c.from_output_name,
            toBrickId: c.to_brick_id,
            toInputName: c.to_input_name,
            createdAt: c.created_at.toISOString(),
          })),
      });
    }
  );
}

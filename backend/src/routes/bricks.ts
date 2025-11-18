import { FastifyInstance } from 'fastify';
import { query, queryOne, queryMany } from '../db/client';
import { validateUUID } from '../utils/validation';
import { ValidationError, BusinessLogicError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess } from '../utils/permissions';

interface CreateBrickBody {
  type: string;
  positionX: number;
  positionY: number;
  configuration: Record<string, unknown>;
}

interface UpdateBrickBody {
  positionX?: number;
  positionY?: number;
  configuration?: Record<string, unknown>;
}

interface CreateConnectionBody {
  fromOutputName: string;
  toBrickId: string;
  toInputName: string;
}

const VALID_BRICK_TYPES = ['ListInstancesByDB', 'GetFirstInstance', 'LogInstanceProps', 'Function'];

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

interface FunctionRow {
  id: string;
  project_id: string;
}

interface ConnectionRow {
  id: string;
  from_brick_id: string;
  from_output_name: string;
  to_brick_id: string;
  to_input_name: string;
  created_at: Date;
}

export async function brickRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /api/v1/functions/:id/bricks
  fastify.post<{ Body: CreateBrickBody }>(
    '/functions/:functionId/bricks',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: CreateBrickBody }, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { functionId: string }).functionId;
      const { type, positionX, positionY, configuration } = request.body as CreateBrickBody;

      validateUUID(functionId, 'functionId');

      if (!type || !VALID_BRICK_TYPES.includes(type)) {
        throw new ValidationError('Invalid brick type', {
          field: 'type',
          validationErrors: [
            {
              field: 'type',
              message: `Brick type must be one of: ${VALID_BRICK_TYPES.join(', ')}`,
            },
          ],
        });
      }

      if (
        typeof positionX !== 'number' ||
        positionX < 0 ||
        positionX > 10000 ||
        typeof positionY !== 'number' ||
        positionY < 0 ||
        positionY > 10000
      ) {
        throw new ValidationError('Invalid position', {
          field: 'positionX',
          validationErrors: [
            {
              field: 'positionX',
              message: 'Position X and Y must be numbers between 0 and 10000',
            },
          ],
        });
      }

      if (!configuration || typeof configuration !== 'object') {
        throw new ValidationError('Invalid configuration', {
          field: 'configuration',
          validationErrors: [
            {
              field: 'configuration',
              message: 'Configuration must be a valid object',
            },
          ],
        });
      }

      const func = await queryOne<FunctionRow>(
        'SELECT id, project_id FROM functions WHERE id = $1',
        [functionId]
      );

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.project_id);

      // Ensure configuration is always an object (not null)
      const normalizedConfig = configuration && typeof configuration === 'object' ? configuration : {};

      const brickId = crypto.randomUUID();

      await query(
        `INSERT INTO bricks (id, function_id, type, position_x, position_y, configuration, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [brickId, functionId, type, positionX, positionY, JSON.stringify(normalizedConfig)]
      );

      const brick = await queryOne<BrickRow>(
        'SELECT id, function_id, type, position_x, position_y, configuration, created_at, updated_at FROM bricks WHERE id = $1',
        [brickId]
      );

      reply.status(201).send({
        brick: {
          id: brick!.id,
          functionId: brick!.function_id,
          type: brick!.type,
          positionX: brick!.position_x,
          positionY: brick!.position_y,
          configuration:
            typeof brick!.configuration === 'string'
              ? JSON.parse(brick!.configuration)
              : brick!.configuration,
          createdAt: brick!.created_at.toISOString(),
          updatedAt: brick!.updated_at.toISOString(),
        },
      });
    }
  );

  // PUT /api/v1/bricks/:id
  fastify.put<{ Body: UpdateBrickBody }>(
    '/bricks/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: UpdateBrickBody }, reply) => {
      const userId = request.userId!;
      const brickId = (request.params as { id: string }).id;
      const { positionX, positionY, configuration } = request.body as UpdateBrickBody;

      validateUUID(brickId, 'id');

      const brick = await queryOne<BrickRow & { project_id: string }>(
        `SELECT b.id, b.function_id, b.type, b.position_x, b.position_y, b.configuration, b.created_at, b.updated_at, f.project_id
        FROM bricks b
        JOIN functions f ON b.function_id = f.id
        WHERE b.id = $1`,
        [brickId]
      );

      if (!brick) {
        throw new NotFoundError('Brick');
      }

      await checkProjectAccess(userId, brick.project_id);

      const updateData: string[] = [];
      const updateValues: unknown[] = [];
      let paramIndex = 1;

      if (positionX !== undefined) {
        if (typeof positionX !== 'number' || positionX < 0 || positionX > 10000) {
          throw new ValidationError('Invalid position X', {
            field: 'positionX',
            validationErrors: [
              {
                field: 'positionX',
                message: 'Position X must be a number between 0 and 10000',
              },
            ],
          });
        }
        updateData.push(`position_x = $${paramIndex}`);
        updateValues.push(positionX);
        paramIndex += 1;
      }

      if (positionY !== undefined) {
        if (typeof positionY !== 'number' || positionY < 0 || positionY > 10000) {
          throw new ValidationError('Invalid position Y', {
            field: 'positionY',
            validationErrors: [
              {
                field: 'positionY',
                message: 'Position Y must be a number between 0 and 10000',
              },
            ],
          });
        }
        updateData.push(`position_y = $${paramIndex}`);
        updateValues.push(positionY);
        paramIndex += 1;
      }

      if (configuration !== undefined) {
        if (typeof configuration !== 'object' || configuration === null) {
          throw new ValidationError('Invalid configuration', {
            field: 'configuration',
            validationErrors: [
              {
                field: 'configuration',
                message: 'Configuration must be a valid object',
              },
            ],
          });
        }
        const normalizedConfig =
          configuration && typeof configuration === 'object' ? configuration : {};
        updateData.push(`configuration = $${paramIndex}`);
        updateValues.push(JSON.stringify(normalizedConfig));
        paramIndex += 1;
      }

      if (updateData.length > 0) {
        updateData.push('updated_at = NOW()');
        updateValues.push(brickId);

        await query(
          `UPDATE bricks SET ${updateData.join(', ')} WHERE id = $${paramIndex}`,
          updateValues
        );
      }

      const updated = await queryOne<BrickRow>(
        'SELECT id, function_id, type, position_x, position_y, configuration, created_at, updated_at FROM bricks WHERE id = $1',
        [brickId]
      );

      reply.send({
        brick: {
          id: updated!.id,
          functionId: updated!.function_id,
          type: updated!.type,
          positionX: updated!.position_x,
          positionY: updated!.position_y,
          configuration:
            typeof updated!.configuration === 'string'
              ? JSON.parse(updated!.configuration)
              : updated!.configuration,
          createdAt: updated!.created_at.toISOString(),
          updatedAt: updated!.updated_at.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/bricks/:id
  fastify.delete(
    '/bricks/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const brickId = (request.params as { id: string }).id;

      validateUUID(brickId, 'id');

      const brick = await queryOne<BrickRow & { project_id: string }>(
        `SELECT b.id, f.project_id
        FROM bricks b
        JOIN functions f ON b.function_id = f.id
        WHERE b.id = $1`,
        [brickId]
      );

      if (!brick) {
        throw new NotFoundError('Brick');
      }

      await checkProjectAccess(userId, brick.project_id);

      await query('DELETE FROM bricks WHERE id = $1', [brickId]);

      reply.send({ message: 'Brick deleted successfully' });
    }
  );

  // POST /api/v1/bricks/:id/connections
  fastify.post<{ Body: CreateConnectionBody }>(
    '/bricks/:id/connections',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: CreateConnectionBody }, reply) => {
      const userId = request.userId!;
      const fromBrickId = (request.params as { id: string }).id;
      const { fromOutputName, toBrickId, toInputName } = request.body as CreateConnectionBody;

      validateUUID(fromBrickId, 'id');
      validateUUID(toBrickId, 'toBrickId');

      if (!fromOutputName || fromOutputName.length < 1 || fromOutputName.length > 100) {
        throw new ValidationError('Invalid output name', {
          field: 'fromOutputName',
          validationErrors: [
            {
              field: 'fromOutputName',
              message: 'Output name must be between 1 and 100 characters',
            },
          ],
        });
      }

      if (!toInputName || toInputName.length < 1 || toInputName.length > 100) {
        throw new ValidationError('Invalid input name', {
          field: 'toInputName',
          validationErrors: [
            {
              field: 'toInputName',
              message: 'Input name must be between 1 and 100 characters',
            },
          ],
        });
      }

      const [fromBrick, toBrick] = await Promise.all([
        queryOne<BrickRow & { project_id: string }>(
          `SELECT b.id, b.function_id, f.project_id
          FROM bricks b
          JOIN functions f ON b.function_id = f.id
          WHERE b.id = $1`,
          [fromBrickId]
        ),
        queryOne<BrickRow & { project_id: string }>(
          `SELECT b.id, b.function_id, f.project_id
          FROM bricks b
          JOIN functions f ON b.function_id = f.id
          WHERE b.id = $1`,
          [toBrickId]
        ),
      ]);

      if (!fromBrick || !toBrick) {
        throw new NotFoundError('Brick');
      }

      if (fromBrick.function_id !== toBrick.function_id) {
        throw new BusinessLogicError(
          'INVALID_BRICK_CONNECTION',
          'Bricks must belong to the same function'
        );
      }

      await checkProjectAccess(userId, fromBrick.project_id);

      // Check if connection already exists
      const existing = await queryOne<ConnectionRow>(
        `SELECT id FROM brick_connections
        WHERE from_brick_id = $1 AND from_output_name = $2 AND to_brick_id = $3 AND to_input_name = $4`,
        [fromBrickId, fromOutputName, toBrickId, toInputName]
      );

      if (existing) {
        throw new BusinessLogicError('LINK_ALREADY_EXISTS', 'Link already exists');
      }

      const connectionId = crypto.randomUUID();

      await query(
        `INSERT INTO brick_connections (id, from_brick_id, from_output_name, to_brick_id, to_input_name, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())`,
        [connectionId, fromBrickId, fromOutputName, toBrickId, toInputName]
      );

      const connection = await queryOne<ConnectionRow>(
        `SELECT id, from_brick_id, from_output_name, to_brick_id, to_input_name, created_at
        FROM brick_connections WHERE id = $1`,
        [connectionId]
      );

      reply.status(201).send({
        connection: {
          id: connection!.id,
          fromBrickId: connection!.from_brick_id,
          fromOutputName: connection!.from_output_name,
          toBrickId: connection!.to_brick_id,
          toInputName: connection!.to_input_name,
          createdAt: connection!.created_at.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/bricks/:id/connections/:connectionId
  fastify.delete(
    '/bricks/:id/connections/:connectionId',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const brickId = (request.params as { id: string }).id;
      const connectionId = (request.params as { connectionId: string }).connectionId;

      validateUUID(brickId, 'id');
      validateUUID(connectionId, 'connectionId');

      const connection = await queryOne<ConnectionRow & { project_id: string }>(
        `SELECT bc.id, bc.from_brick_id, f.project_id
        FROM brick_connections bc
        JOIN bricks b ON bc.from_brick_id = b.id
        JOIN functions f ON b.function_id = f.id
        WHERE bc.id = $1`,
        [connectionId]
      );

      if (!connection || connection.from_brick_id !== brickId) {
        throw new NotFoundError('Connection');
      }

      await checkProjectAccess(userId, connection.project_id);

      await query('DELETE FROM brick_connections WHERE id = $1', [connectionId]);

      reply.send({ message: 'Connection deleted successfully' });
    }
  );
}

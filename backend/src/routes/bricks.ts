import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
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

export async function brickRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /api/v1/functions/:id/bricks
  fastify.post<{ Body: CreateBrickBody }>(
    '/functions/:functionId/bricks',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: CreateBrickBody }, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { functionId: string }).functionId;
      const { type, positionX, positionY, configuration } = request.body;

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

      const func = await prisma.function.findUnique({
        where: { id: functionId },
        include: { project: true },
      });

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.projectId);

      // Ensure configuration is always an object (not null)
      const normalizedConfig = configuration && typeof configuration === 'object' ? configuration : {};
      
      const brick = await prisma.brick.create({
        data: {
          functionId,
          type,
          positionX,
          positionY,
          configuration: normalizedConfig as object,
        },
      });

      reply.status(201).send({
        brick: {
          id: brick.id,
          functionId: brick.functionId,
          type: brick.type,
          positionX: brick.positionX,
          positionY: brick.positionY,
          configuration: brick.configuration,
          createdAt: brick.createdAt.toISOString(),
          updatedAt: brick.updatedAt.toISOString(),
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
      const { positionX, positionY, configuration } = request.body;

      validateUUID(brickId, 'id');

      const brick = await prisma.brick.findUnique({
        where: { id: brickId },
        include: {
          function: {
            include: { project: true },
          },
        },
      });

      if (!brick) {
        throw new NotFoundError('Brick');
      }

      await checkProjectAccess(userId, brick.function.projectId);

      const updateData: {
        positionX?: number;
        positionY?: number;
        configuration?: object;
      } = {};

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
        updateData.positionX = positionX;
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
        updateData.positionY = positionY;
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
        // Ensure configuration is always an object (not null)
        const normalizedConfig = configuration && typeof configuration === 'object' ? configuration : {};
        console.log(`[BrickRoutes] Updating brick ${brickId} configuration:`, JSON.stringify(normalizedConfig));
        updateData.configuration = normalizedConfig as object;
      }

      const updated = await prisma.brick.update({
        where: { id: brickId },
        data: updateData,
      });
      console.log(`[BrickRoutes] Updated brick ${brickId} configuration:`, JSON.stringify(updated.configuration));

      reply.send({
        brick: {
          id: updated.id,
          functionId: updated.functionId,
          type: updated.type,
          positionX: updated.positionX,
          positionY: updated.positionY,
          configuration: updated.configuration,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
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

      const brick = await prisma.brick.findUnique({
        where: { id: brickId },
        include: {
          function: {
            include: { project: true },
          },
        },
      });

      if (!brick) {
        throw new NotFoundError('Brick');
      }

      await checkProjectAccess(userId, brick.function.projectId);

      await prisma.brick.delete({
        where: { id: brickId },
      });

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
      const { fromOutputName, toBrickId, toInputName } = request.body;

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
        prisma.brick.findUnique({
          where: { id: fromBrickId },
          include: { function: { include: { project: true } } },
        }),
        prisma.brick.findUnique({
          where: { id: toBrickId },
          include: { function: { include: { project: true } } },
        }),
      ]);

      if (!fromBrick || !toBrick) {
        throw new NotFoundError('Brick');
      }

      if (fromBrick.functionId !== toBrick.functionId) {
        throw new BusinessLogicError(
          'INVALID_BRICK_CONNECTION',
          'Bricks must belong to the same function'
        );
      }

      await checkProjectAccess(userId, fromBrick.function.projectId);

      // Check if connection already exists
      const existing = await prisma.brickConnection.findFirst({
        where: {
          fromBrickId,
          fromOutputName,
          toBrickId,
          toInputName,
        },
      });

      if (existing) {
        throw new BusinessLogicError('LINK_ALREADY_EXISTS', 'Link already exists');
      }

      const connection = await prisma.brickConnection.create({
        data: {
          fromBrickId,
          fromOutputName,
          toBrickId,
          toInputName,
        },
      });

      reply.status(201).send({
        connection: {
          id: connection.id,
          fromBrickId: connection.fromBrickId,
          fromOutputName: connection.fromOutputName,
          toBrickId: connection.toBrickId,
          toInputName: connection.toInputName,
          createdAt: connection.createdAt.toISOString(),
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

      const connection = await prisma.brickConnection.findUnique({
        where: { id: connectionId },
        include: {
          fromBrick: {
            include: {
              function: {
                include: { project: true },
              },
            },
          },
        },
      });

      if (!connection || connection.fromBrickId !== brickId) {
        throw new NotFoundError('Connection');
      }

      await checkProjectAccess(userId, connection.fromBrick.function.projectId);

      await prisma.brickConnection.delete({
        where: { id: connectionId },
      });

      reply.send({ message: 'Connection deleted successfully' });
    }
  );
}

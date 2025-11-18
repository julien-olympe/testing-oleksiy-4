import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
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

      const functions = await prisma.function.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      reply.send({
        functions: functions.map((f) => ({
          id: f.id,
          name: f.name,
          projectId: f.projectId,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
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
      const { name } = request.body;

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

      const func = await prisma.function.create({
        data: {
          name: functionName,
          projectId,
        },
      });

      reply.status(201).send({
        function: {
          id: func.id,
          name: func.name,
          projectId: func.projectId,
          createdAt: func.createdAt.toISOString(),
          updatedAt: func.updatedAt.toISOString(),
        },
      });
    }
  );

  // GET /api/v1/functions/:id
  fastify.get(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;

      validateUUID(functionId, 'id');

      const func = await prisma.function.findUnique({
        where: { id: functionId },
        include: { project: true },
      });

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.projectId);

      reply.send({
        function: {
          id: func.id,
          name: func.name,
          projectId: func.projectId,
          createdAt: func.createdAt.toISOString(),
          updatedAt: func.updatedAt.toISOString(),
        },
      });
    }
  );

  // PUT /api/v1/functions/:id
  fastify.put<{ Body: UpdateFunctionBody }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: UpdateFunctionBody }, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;
      const { name } = request.body;

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

      const func = await prisma.function.findUnique({
        where: { id: functionId },
        include: { project: true },
      });

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.projectId);

      const updated = await prisma.function.update({
        where: { id: functionId },
        data: { name },
      });

      reply.send({
        function: {
          id: updated.id,
          name: updated.name,
          projectId: updated.projectId,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/functions/:id
  fastify.delete(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;

      validateUUID(functionId, 'id');

      const func = await prisma.function.findUnique({
        where: { id: functionId },
        include: { project: true },
      });

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.projectId);

      await prisma.function.delete({
        where: { id: functionId },
      });

      reply.send({ message: 'Function deleted successfully' });
    }
  );

  // GET /api/v1/functions/:id/editor
  fastify.get(
    '/:id/editor',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;

      validateUUID(functionId, 'id');

      const func = await prisma.function.findUnique({
        where: { id: functionId },
        include: {
          project: true,
          bricks: {
            include: {
              connectionsFrom: true,
              connectionsTo: true,
            },
          },
        },
      });

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.projectId);

      reply.send({
        function: {
          id: func.id,
          name: func.name,
          projectId: func.projectId,
          createdAt: func.createdAt.toISOString(),
          updatedAt: func.updatedAt.toISOString(),
        },
        bricks: func.bricks.map((b) => ({
          id: b.id,
          functionId: b.functionId,
          type: b.type,
          positionX: b.positionX,
          positionY: b.positionY,
          configuration: b.configuration,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
        connections: func.bricks.flatMap((b) =>
          b.connectionsFrom.map((c) => ({
            id: c.id,
            fromBrickId: c.fromBrickId,
            fromOutputName: c.fromOutputName,
            toBrickId: c.toBrickId,
            toInputName: c.toInputName,
            createdAt: c.createdAt.toISOString(),
          }))
        ),
      });
    }
  );
}

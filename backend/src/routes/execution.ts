import { FastifyInstance } from 'fastify';
import { validateUUID } from '../utils/validation';
import { NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess } from '../utils/permissions';
import { ExecutionEngine } from '../utils/execution-engine';
import { prisma } from '../db/client';

export async function executionRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /api/v1/functions/:id/run
  fastify.post(
    '/functions/:id/run',
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

      const execution = await ExecutionEngine.executeFunction(functionId);

      reply.send({ execution });
    }
  );
}

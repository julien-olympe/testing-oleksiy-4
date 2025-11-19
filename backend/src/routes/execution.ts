import { FastifyInstance } from 'fastify';
import { validateUUID } from '../utils/validation';
import { NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess } from '../utils/permissions';
import { ExecutionEngine } from '../utils/execution-engine';
import { queryOne } from '../db/client';

interface FunctionRow {
  id: string;
  project_id: string;
}

export async function executionRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /api/v1/functions/:id/run
  fastify.post(
    '/functions/:id/run',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const functionId = (request.params as { id: string }).id;

      validateUUID(functionId, 'id');

      const func = await queryOne<FunctionRow>(
        'SELECT id, project_id FROM functions WHERE id = $1',
        [functionId]
      );

      if (!func) {
        throw new NotFoundError('Function');
      }

      await checkProjectAccess(userId, func.project_id);

      const execution = await ExecutionEngine.executeFunction(functionId);

      reply.send({ execution });
    }
  );
}

import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { validateUUID, validateEmail } from '../utils/validation';
import { ValidationError, BusinessLogicError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess, checkProjectOwnership } from '../utils/permissions';

interface AddPermissionBody {
  email: string;
}

export async function permissionRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/projects/:id/permissions
  fastify.get(
    '/projects/:projectId/permissions',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;

      validateUUID(projectId, 'projectId');

      await checkProjectAccess(userId, projectId);

      const permissions = await prisma.projectPermission.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      reply.send({
        permissions: permissions.map((p) => ({
          userId: p.userId,
          userEmail: p.user.email,
          createdAt: p.createdAt.toISOString(),
        })),
      });
    }
  );

  // POST /api/v1/projects/:id/permissions
  fastify.post<{ Body: AddPermissionBody; Params: { projectId: string } }>(
    '/projects/:projectId/permissions',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: AddPermissionBody; params: { projectId: string } }, reply) => {
      const userId = request.userId!;
      const projectId = request.params.projectId;
      const { email } = request.body;

      validateUUID(projectId, 'projectId');

      if (!email) {
        throw new ValidationError('Required field is missing', {
          field: 'email',
          validationErrors: [
            {
              field: 'email',
              message: 'Email is required',
            },
          ],
        });
      }

      validateEmail(email);

      await checkProjectOwnership(userId, projectId);

      // Find user by email
      const targetUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!targetUser) {
        throw new NotFoundError('User');
      }

      if (targetUser.id === userId) {
        throw new BusinessLogicError(
          'CANNOT_ADD_SELF',
          'You cannot add yourself as a permission holder'
        );
      }

      // Check if permission already exists
      const existing = await prisma.projectPermission.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: targetUser.id,
          },
        },
      });

      if (existing) {
        throw new BusinessLogicError(
          'USER_ALREADY_HAS_PERMISSION',
          'User already has permission for this project'
        );
      }

      const permission = await prisma.projectPermission.create({
        data: {
          projectId,
          userId: targetUser.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      reply.status(201).send({
        permission: {
          userId: permission.userId,
          userEmail: permission.user.email,
          createdAt: permission.createdAt.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/projects/:id/permissions/:userId
  fastify.delete(
    '/projects/:projectId/permissions/:targetUserId',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const targetUserId = (request.params as { targetUserId: string }).targetUserId;

      validateUUID(projectId, 'projectId');
      validateUUID(targetUserId, 'targetUserId');

      await checkProjectOwnership(userId, projectId);

      await prisma.projectPermission.delete({
        where: {
          projectId_userId: {
            projectId,
            userId: targetUserId,
          },
        },
      });

      reply.send({ message: 'Permission removed successfully' });
    }
  );
}

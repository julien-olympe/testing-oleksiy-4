import { FastifyInstance } from 'fastify';
import { query, queryOne, queryMany } from '../db/client';
import { validateUUID, validateEmail } from '../utils/validation';
import { ValidationError, BusinessLogicError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess, checkProjectOwnership } from '../utils/permissions';

interface AddPermissionBody {
  email: string;
}

interface PermissionRow {
  user_id: string;
  user_email: string;
  created_at: Date;
}

interface UserRow {
  id: string;
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

      const permissions = await queryMany<PermissionRow>(
        `SELECT 
          pp.user_id,
          u.email as user_email,
          pp.created_at
        FROM project_permissions pp
        JOIN users u ON pp.user_id = u.id
        WHERE pp.project_id = $1
        ORDER BY pp.created_at ASC`,
        [projectId]
      );

      reply.send({
        permissions: permissions.map((p) => ({
          userId: p.user_id,
          userEmail: p.user_email,
          createdAt: p.created_at.toISOString(),
        })),
      });
    }
  );

  // POST /api/v1/projects/:id/permissions
  fastify.post<{ Body: AddPermissionBody }>(
    '/projects/:projectId/permissions',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: AddPermissionBody }, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const { email } = request.body as AddPermissionBody;

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
      const targetUser = await queryOne<UserRow>(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );

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
      const existing = await queryOne<{ project_id: string; user_id: string }>(
        'SELECT project_id, user_id FROM project_permissions WHERE project_id = $1 AND user_id = $2',
        [projectId, targetUser.id]
      );

      if (existing) {
        throw new BusinessLogicError(
          'USER_ALREADY_HAS_PERMISSION',
          'User already has permission for this project'
        );
      }

      await query(
        'INSERT INTO project_permissions (project_id, user_id, created_at) VALUES ($1, $2, NOW())',
        [projectId, targetUser.id]
      );

      const permission = await queryOne<PermissionRow>(
        `SELECT 
          pp.user_id,
          u.email as user_email,
          pp.created_at
        FROM project_permissions pp
        JOIN users u ON pp.user_id = u.id
        WHERE pp.project_id = $1 AND pp.user_id = $2`,
        [projectId, targetUser.id]
      );

      reply.status(201).send({
        permission: {
          userId: permission!.user_id,
          userEmail: permission!.user_email,
          createdAt: permission!.created_at.toISOString(),
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

      await query(
        'DELETE FROM project_permissions WHERE project_id = $1 AND user_id = $2',
        [projectId, targetUserId]
      );

      reply.send({ message: 'Permission removed successfully' });
    }
  );
}

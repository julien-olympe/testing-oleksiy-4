import { FastifyInstance } from 'fastify';
import { query, queryOne, queryMany } from '../db/client';
import { validateUUID } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess, checkProjectOwnership } from '../utils/permissions';

interface CreateProjectBody {
  name?: string;
}

interface UpdateProjectBody {
  name: string;
}

interface ProjectRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export async function projectRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/projects
  fastify.get(
    '/',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const limit = Math.min(parseInt((request.query as { limit?: string }).limit || '50', 10), 50);
      const offset = Math.max(parseInt((request.query as { offset?: string }).offset || '0', 10), 0);

      if (limit < 1 || limit > 50) {
        throw new ValidationError('Invalid query parameters', {
          validationErrors: [
            {
              field: 'limit',
              message: 'Limit must be between 1 and 50',
            },
          ],
        });
      }

      // Get projects where user is owner or has permission
      const projects = await queryMany<ProjectRow>(
        `SELECT DISTINCT p.id, p.name, p.owner_id, p.created_at, p.updated_at
        FROM projects p
        LEFT JOIN project_permissions pp ON p.id = pp.project_id
        WHERE p.owner_id = $1 OR pp.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const totalResult = await queryOne<{ count: string }>(
        `SELECT COUNT(DISTINCT p.id)::text as count
        FROM projects p
        LEFT JOIN project_permissions pp ON p.id = pp.project_id
        WHERE p.owner_id = $1 OR pp.user_id = $1`,
        [userId]
      );

      const total = parseInt(totalResult?.count || '0', 10);

      reply.send({
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          ownerId: p.owner_id,
          createdAt: p.created_at.toISOString(),
          updatedAt: p.updated_at.toISOString(),
        })),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      });
    }
  );

  // POST /api/v1/projects
  fastify.post<{ Body: CreateProjectBody }>(
    '/',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: CreateProjectBody }, reply) => {
      const userId = request.userId!;
      const { name } = request.body as CreateProjectBody;

      const projectName = name || 'New Project';

      if (projectName.length < 1 || projectName.length > 255) {
        throw new ValidationError('Invalid project name', {
          field: 'name',
          validationErrors: [
            {
              field: 'name',
              message: 'Project name must be between 1 and 255 characters',
            },
          ],
        });
      }

      const projectId = crypto.randomUUID();

      await query(
        'INSERT INTO projects (id, name, owner_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [projectId, projectName, userId]
      );

      const project = await queryOne<ProjectRow>(
        'SELECT id, name, owner_id, created_at, updated_at FROM projects WHERE id = $1',
        [projectId]
      );

      reply.status(201).send({
        project: {
          id: project!.id,
          name: project!.name,
          ownerId: project!.owner_id,
          createdAt: project!.created_at.toISOString(),
          updatedAt: project!.updated_at.toISOString(),
        },
      });
    }
  );

  // GET /api/v1/projects/:id
  fastify.get(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;

      validateUUID(projectId, 'id');

      await checkProjectAccess(userId, projectId);

      const project = await queryOne<ProjectRow>(
        'SELECT id, name, owner_id, created_at, updated_at FROM projects WHERE id = $1',
        [projectId]
      );

      if (!project) {
        throw new NotFoundError('Project');
      }

      reply.send({
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.owner_id,
          createdAt: project.created_at.toISOString(),
          updatedAt: project.updated_at.toISOString(),
        },
      });
    }
  );

  // PUT /api/v1/projects/:id
  fastify.put<{ Body: UpdateProjectBody }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: UpdateProjectBody }, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;
      const { name } = request.body as UpdateProjectBody;

      validateUUID(projectId, 'id');

      if (!name || name.length < 1 || name.length > 255) {
        throw new ValidationError('Invalid project name', {
          field: 'name',
          validationErrors: [
            {
              field: 'name',
              message: 'Project name must be between 1 and 255 characters',
            },
          ],
        });
      }

      await checkProjectAccess(userId, projectId);

      await query('UPDATE projects SET name = $1, updated_at = NOW() WHERE id = $2', [
        name,
        projectId,
      ]);

      const project = await queryOne<ProjectRow>(
        'SELECT id, name, owner_id, created_at, updated_at FROM projects WHERE id = $1',
        [projectId]
      );

      reply.send({
        project: {
          id: project!.id,
          name: project!.name,
          ownerId: project!.owner_id,
          createdAt: project!.created_at.toISOString(),
          updatedAt: project!.updated_at.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/projects/:id
  fastify.delete(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;

      validateUUID(projectId, 'id');

      await checkProjectOwnership(userId, projectId);

      // Delete project (cascade will handle related data)
      await query('DELETE FROM projects WHERE id = $1', [projectId]);

      reply.send({ message: 'Project deleted successfully' });
    }
  );

  // GET /api/v1/projects/:id/editor
  fastify.get(
    '/:id/editor',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;

      validateUUID(projectId, 'id');

      await checkProjectAccess(userId, projectId);

      const project = await queryOne<ProjectRow>(
        'SELECT id, name, owner_id, created_at, updated_at FROM projects WHERE id = $1',
        [projectId]
      );

      if (!project) {
        throw new NotFoundError('Project');
      }

      // Get functions
      const functions = await queryMany<{
        id: string;
        name: string;
        project_id: string;
        created_at: Date;
        updated_at: Date;
      }>(
        'SELECT id, name, project_id, created_at, updated_at FROM functions WHERE project_id = $1',
        [projectId]
      );

      // Get permissions
      const permissions = await queryMany<{
        user_id: string;
        user_email: string;
        created_at: Date;
      }>(
        `SELECT pp.user_id, u.email as user_email, pp.created_at
        FROM project_permissions pp
        JOIN users u ON pp.user_id = u.id
        WHERE pp.project_id = $1
        ORDER BY pp.created_at ASC`,
        [projectId]
      );

      // Get project databases with properties
      const projectDatabases = await queryMany<{
        id: string;
        name: string;
        project_id: string;
        created_at: Date;
      }>('SELECT id, name, project_id, created_at FROM databases WHERE project_id = $1', [
        projectId,
      ]);

      // Get properties for each database
      const databasesWithProperties = await Promise.all(
        projectDatabases.map(async (db) => {
          const properties = await queryMany<{
            id: string;
            name: string;
            type: string;
            created_at: Date;
          }>(
            'SELECT id, name, type, created_at FROM database_properties WHERE database_id = $1',
            [db.id]
          );
          return { ...db, properties };
        })
      );

      // Get default database (system database)
      const defaultDatabase = await queryOne<{
        id: string;
        name: string;
        project_id: string;
        created_at: Date;
      }>(
        "SELECT id, name, project_id, created_at FROM databases WHERE name = 'default database' AND project_id = '00000000-0000-0000-0000-000000000000'"
      );

      let defaultDatabaseWithProperties = null;
      if (defaultDatabase) {
        const properties = await queryMany<{
          id: string;
          name: string;
          type: string;
          created_at: Date;
        }>(
          'SELECT id, name, type, created_at FROM database_properties WHERE database_id = $1',
          [defaultDatabase.id]
        );
        defaultDatabaseWithProperties = { ...defaultDatabase, properties };
      }

      // Get instances for project databases
      const projectDatabasesWithInstances = await Promise.all(
        databasesWithProperties.map(async (db) => {
          const instances = await queryMany<{
            id: string;
            database_id: string;
            created_at: Date;
            updated_at: Date;
          }>(
            'SELECT id, database_id, created_at, updated_at FROM database_instances WHERE database_id = $1 ORDER BY created_at DESC',
            [db.id]
          );

          const instancesWithValues = await Promise.all(
            instances.map(async (instance) => {
              const values = await queryMany<{
                property_id: string;
                property_name: string;
                value: string;
              }>(
                `SELECT 
                  div.property_id,
                  dp.name as property_name,
                  div.value
                FROM database_instance_values div
                JOIN database_properties dp ON div.property_id = dp.id
                WHERE div.instance_id = $1`,
                [instance.id]
              );
              return {
                ...instance,
                values: values.map((v) => ({
                  propertyId: v.property_id,
                  propertyName: v.property_name,
                  value: v.value,
                })),
              };
            })
          );

          return { ...db, instances: instancesWithValues };
        })
      );

      // Get instances for default database
      let defaultDatabaseWithInstances = null;
      if (defaultDatabaseWithProperties) {
        const instances = await queryMany<{
          id: string;
          database_id: string;
          created_at: Date;
          updated_at: Date;
        }>(
          'SELECT id, database_id, created_at, updated_at FROM database_instances WHERE database_id = $1 ORDER BY created_at DESC',
          [defaultDatabaseWithProperties.id]
        );

        const instancesWithValues = await Promise.all(
          instances.map(async (instance) => {
            const values = await queryMany<{
              property_id: string;
              property_name: string;
              value: string;
            }>(
              `SELECT 
                div.property_id,
                dp.name as property_name,
                div.value
              FROM database_instance_values div
              JOIN database_properties dp ON div.property_id = dp.id
              WHERE div.instance_id = $1`,
              [instance.id]
            );
            return {
              ...instance,
              values: values.map((v) => ({
                propertyId: v.property_id,
                propertyName: v.property_name,
                value: v.value,
              })),
            };
          })
        );

        defaultDatabaseWithInstances = {
          ...defaultDatabaseWithProperties,
          instances: instancesWithValues,
        };
      }

      // Combine default database with project databases
      const allDatabases = defaultDatabaseWithInstances
        ? [defaultDatabaseWithInstances, ...projectDatabasesWithInstances]
        : projectDatabasesWithInstances;

      reply.send({
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.owner_id,
          createdAt: project.created_at.toISOString(),
          updatedAt: project.updated_at.toISOString(),
        },
        functions: functions.map((f) => ({
          id: f.id,
          name: f.name,
          projectId: f.project_id,
          createdAt: f.created_at.toISOString(),
          updatedAt: f.updated_at.toISOString(),
        })),
        permissions: permissions.map((p) => ({
          userId: p.user_id,
          userEmail: p.user_email,
          createdAt: p.created_at.toISOString(),
        })),
        databases: allDatabases.map((d) => ({
          id: d.id,
          name: d.name,
          projectId: d.project_id,
          createdAt: d.created_at.toISOString(),
          properties: d.properties.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            createdAt: p.created_at.toISOString(),
          })),
          instances: (d.instances || []).map((i) => ({
            id: i.id,
            databaseId: i.database_id,
            values: i.values,
            createdAt: i.created_at.toISOString(),
            updatedAt: i.updated_at.toISOString(),
          })),
        })),
      });
    }
  );
}

import { FastifyInstance } from 'fastify';
import { query, queryOne, queryMany, transaction } from '../db/client';
import { validateUUID } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess } from '../utils/permissions';

interface UpdateInstanceBody {
  propertyId: string;
  value: string;
}

interface DatabaseRow {
  id: string;
  name: string;
  project_id: string;
}

interface PropertyRow {
  id: string;
  name: string;
  type: string;
}

interface InstanceRow {
  id: string;
  database_id: string;
  created_at: Date;
  updated_at: Date;
}

interface InstanceValueRow {
  property_id: string;
  property_name: string;
  value: string;
}

export async function databaseRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/projects/:id/databases
  fastify.get(
    '/projects/:projectId/databases',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;

      validateUUID(projectId, 'projectId');

      await checkProjectAccess(userId, projectId);

      // Get project databases and default database
      const [projectDatabases, defaultDatabase] = await Promise.all([
        queryMany<DatabaseRow>(
          'SELECT id, name, project_id FROM databases WHERE project_id = $1',
          [projectId]
        ),
        queryOne<DatabaseRow>(
          "SELECT id, name, project_id FROM databases WHERE name = 'default database' AND project_id = '00000000-0000-0000-0000-000000000000'"
        ),
      ]);

      const databases = defaultDatabase ? [defaultDatabase, ...projectDatabases] : projectDatabases;

      // Get properties for each database
      const databasesWithProperties = await Promise.all(
        databases.map(async (db) => {
          const properties = await queryMany<PropertyRow>(
            'SELECT id, name, type FROM database_properties WHERE database_id = $1',
            [db.id]
          );
          return { ...db, properties };
        })
      );

      reply.send({
        databases: databasesWithProperties.map((d) => ({
          id: d.id,
          name: d.name,
          projectId: d.project_id,
          properties: d.properties.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
          })),
        })),
      });
    }
  );

  // GET /api/v1/projects/:id/databases/:databaseId/instances
  fastify.get(
    '/projects/:projectId/databases/:databaseId/instances',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');

      await checkProjectAccess(userId, projectId);

      const database = await queryOne<DatabaseRow>(
        'SELECT id, name, project_id FROM databases WHERE id = $1',
        [databaseId]
      );

      if (!database) {
        throw new NotFoundError('Database');
      }

      const instances = await queryMany<InstanceRow>(
        'SELECT id, database_id, created_at, updated_at FROM database_instances WHERE database_id = $1 ORDER BY created_at DESC',
        [databaseId]
      );

      const instancesWithValues = await Promise.all(
        instances.map(async (instance) => {
          const values = await queryMany<InstanceValueRow>(
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

      reply.send({
        instances: instancesWithValues.map((i) => ({
          id: i.id,
          databaseId: i.database_id,
          values: i.values,
          createdAt: i.created_at.toISOString(),
          updatedAt: i.updated_at.toISOString(),
        })),
      });
    }
  );

  // POST /api/v1/projects/:id/databases/:databaseId/instances
  fastify.post(
    '/projects/:projectId/databases/:databaseId/instances',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');

      await checkProjectAccess(userId, projectId);

      const database = await queryOne<DatabaseRow>(
        'SELECT id, name, project_id FROM databases WHERE id = $1',
        [databaseId]
      );

      if (!database) {
        throw new NotFoundError('Database');
      }

      const properties = await queryMany<PropertyRow>(
        'SELECT id, name, type FROM database_properties WHERE database_id = $1',
        [databaseId]
      );

      const instance = await transaction(async (client) => {
        const instanceId = crypto.randomUUID();
        await client.query(
          'INSERT INTO database_instances (id, database_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
          [instanceId, databaseId]
        );

        // Create empty values for all properties
        await Promise.all(
          properties.map((property) =>
            client.query(
              'INSERT INTO database_instance_values (id, instance_id, property_id, value, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW())',
              [instanceId, property.id, '']
            )
          )
        );

        const instance = await client.query<InstanceRow>(
          'SELECT id, database_id, created_at, updated_at FROM database_instances WHERE id = $1',
          [instanceId]
        );

        const values = await client.query<InstanceValueRow>(
          `SELECT 
            div.property_id,
            dp.name as property_name,
            div.value
          FROM database_instance_values div
          JOIN database_properties dp ON div.property_id = dp.id
          WHERE div.instance_id = $1`,
          [instanceId]
        );

        return {
          ...instance.rows[0],
          values: values.rows.map((v) => ({
            propertyId: v.property_id,
            propertyName: v.property_name,
            value: v.value,
          })),
        };
      });

      reply.status(201).send({
        instance: {
          id: instance.id,
          databaseId: instance.database_id,
          values: instance.values,
          createdAt: instance.created_at.toISOString(),
          updatedAt: instance.updated_at.toISOString(),
        },
      });
    }
  );

  // PUT /api/v1/projects/:id/databases/:databaseId/instances/:instanceId
  fastify.put<{ Body: UpdateInstanceBody }>(
    '/projects/:projectId/databases/:databaseId/instances/:instanceId',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest & { body: UpdateInstanceBody }, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;
      const instanceId = (request.params as { instanceId: string }).instanceId;
      const { propertyId, value } = request.body as UpdateInstanceBody;

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');
      validateUUID(instanceId, 'instanceId');
      validateUUID(propertyId, 'propertyId');

      if (value === undefined || value === null) {
        throw new ValidationError('Required field is missing', {
          field: 'value',
          validationErrors: [
            {
              field: 'value',
              message: 'Value is required',
            },
          ],
        });
      }

      if (typeof value !== 'string' || value.length > 10000) {
        throw new ValidationError('Invalid property value', {
          field: 'value',
          validationErrors: [
            {
              field: 'value',
              message: 'Property value must be a string with max length 10000',
            },
          ],
        });
      }

      await checkProjectAccess(userId, projectId);

      const instance = await queryOne<InstanceRow & { database_id: string }>(
        'SELECT id, database_id FROM database_instances WHERE id = $1',
        [instanceId]
      );

      if (!instance || instance.database_id !== databaseId) {
        throw new NotFoundError('Instance');
      }

      const property = await queryOne<PropertyRow & { database_id: string }>(
        'SELECT id, name, type, database_id FROM database_properties WHERE id = $1',
        [propertyId]
      );

      if (!property || property.database_id !== databaseId) {
        throw new NotFoundError('Property');
      }

      // Upsert value
      await query(
        `INSERT INTO database_instance_values (id, instance_id, property_id, value, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW())
        ON CONFLICT (instance_id, property_id)
        DO UPDATE SET value = $3, updated_at = NOW()`,
        [instanceId, propertyId, value]
      );

      const updatedInstance = await queryOne<InstanceRow>(
        'SELECT id, database_id, created_at, updated_at FROM database_instances WHERE id = $1',
        [instanceId]
      );

      const values = await queryMany<InstanceValueRow>(
        `SELECT 
          div.property_id,
          dp.name as property_name,
          div.value
        FROM database_instance_values div
        JOIN database_properties dp ON div.property_id = dp.id
        WHERE div.instance_id = $1`,
        [instanceId]
      );

      reply.send({
        instance: {
          id: updatedInstance!.id,
          databaseId: updatedInstance!.database_id,
          values: values.map((v) => ({
            propertyId: v.property_id,
            propertyName: v.property_name,
            value: v.value,
          })),
          updatedAt: updatedInstance!.updated_at.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/projects/:id/databases/:databaseId/instances/:instanceId
  fastify.delete(
    '/projects/:projectId/databases/:databaseId/instances/:instanceId',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;
      const instanceId = (request.params as { instanceId: string }).instanceId;

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');
      validateUUID(instanceId, 'instanceId');

      await checkProjectAccess(userId, projectId);

      const instance = await queryOne<InstanceRow & { database_id: string }>(
        'SELECT id, database_id FROM database_instances WHERE id = $1',
        [instanceId]
      );

      if (!instance || instance.database_id !== databaseId) {
        throw new NotFoundError('Instance');
      }

      await query('DELETE FROM database_instances WHERE id = $1', [instanceId]);

      reply.send({ message: 'Instance deleted successfully' });
    }
  );
}

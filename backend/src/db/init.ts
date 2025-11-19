import { queryOne, query } from './client';

const SYSTEM_PROJECT_ID = '00000000-0000-0000-0000-000000000000';

export async function initializeDefaultDatabase(): Promise<void> {
  // Check if default database already exists
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM databases WHERE name = 'default database' AND project_id = $1",
    [SYSTEM_PROJECT_ID]
  );

  if (existing) {
    return; // Already initialized
  }

  // Create default database with system project ID
  const databaseId = '00000000-0000-0000-0000-000000000001';
  const propertyId = '00000000-0000-0000-0000-000000000002';

  await query(
    "INSERT INTO databases (id, name, project_id, created_at) VALUES ($1, 'default database', $2, NOW())",
    [databaseId, SYSTEM_PROJECT_ID]
  );

  await query(
    'INSERT INTO database_properties (id, database_id, name, type, created_at) VALUES ($1, $2, $3, $4, NOW())',
    [propertyId, databaseId, 'string', 'string']
  );
}

import { prisma } from './client';

const SYSTEM_PROJECT_ID = '00000000-0000-0000-0000-000000000000';

export async function initializeDefaultDatabase(): Promise<void> {
  // Check if default database already exists
  const existing = await prisma.database.findFirst({
    where: {
      name: 'default database',
      projectId: SYSTEM_PROJECT_ID,
    },
  });

  if (existing) {
    return; // Already initialized
  }

  // Create default database with system project ID
  await prisma.database.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'default database',
      projectId: SYSTEM_PROJECT_ID,
      properties: {
        create: {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'string',
          type: 'string',
        },
      },
    },
  });
}

import { queryOne, query, closePool } from '../db/client';
import { AuthUtils } from '../utils/auth';

const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'SecurePass123!';

interface UserRow {
  id: string;
  email: string;
}

async function ensureTestUser() {
  try {
    // Check if user already exists
    const existingUser = await queryOne<UserRow>(
      'SELECT id, email FROM users WHERE email = $1',
      [TEST_USER_EMAIL]
    );

    if (existingUser) {
      console.log(`Test user ${TEST_USER_EMAIL} already exists`);
      // Update password to ensure it's correct
      const passwordHash = await AuthUtils.hashPassword(TEST_USER_PASSWORD);
      await query('UPDATE users SET password_hash = $1 WHERE email = $2', [
        passwordHash,
        TEST_USER_EMAIL,
      ]);
      console.log(`Test user password updated`);
      return;
    }

    // Create test user
    const passwordHash = await AuthUtils.hashPassword(TEST_USER_PASSWORD);
    const userId = crypto.randomUUID();

    await query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())',
      [userId, TEST_USER_EMAIL, passwordHash]
    );

    console.log(`Test user ${TEST_USER_EMAIL} created successfully`);
  } catch (error) {
    console.error('Error ensuring test user:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

ensureTestUser();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'SecurePass123!';

async function ensureTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
    });

    if (existingUser) {
      console.log(`Test user ${TEST_USER_EMAIL} already exists`);
      // Update password to ensure it's correct
      const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 10);
      await prisma.user.update({
        where: { email: TEST_USER_EMAIL },
        data: { passwordHash },
      });
      console.log(`Test user password updated`);
      await prisma.$disconnect();
      return;
    }

    // Create test user
    const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: TEST_USER_EMAIL,
        passwordHash,
      },
    });

    console.log(`Test user ${TEST_USER_EMAIL} created successfully`);
  } catch (error) {
    console.error('Error ensuring test user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ensureTestUser();

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect().then(() => {
  console.log('Database connected');
  process.exit(0);
}).catch(err => {
  console.error('Database error:', err.message);
  process.exit(1);
});

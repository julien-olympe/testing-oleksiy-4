// Load environment variables from .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Set default values for required environment variables if not present
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
}

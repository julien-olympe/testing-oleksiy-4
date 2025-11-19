import { query } from '../db/client';
import { config } from '../config/env';

describe('Health Check', () => {
  test('Database is reachable', async () => {
    await expect(query('SELECT 1')).resolves.toBeDefined();
  });

  test('Database connection string is configured', () => {
    expect(config.DATABASE_URL).toBeDefined();
    expect(config.DATABASE_URL).toContain('postgresql://');
  });

  test('Backend configuration is valid', () => {
    expect(config.PORT).toBeDefined();
    expect(typeof config.PORT).toBe('number');
    expect(config.PORT).toBeGreaterThan(0);
  });
});

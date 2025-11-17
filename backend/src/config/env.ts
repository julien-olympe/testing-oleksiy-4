export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue || '';
}

export const config: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', '*'),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
};

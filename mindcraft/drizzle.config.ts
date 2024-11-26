import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { getEnv } from './src/utils';

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    user: getEnv('DB_USER'),
    host: getEnv('DB_HOST'),
    database: getEnv('DB_NAME'),
    password: getEnv('DB_PASSWORD'),
    port: parseInt(getEnv('DB_PORT')),
    ssl: {
      rejectUnauthorized: false,
    }
  },
});

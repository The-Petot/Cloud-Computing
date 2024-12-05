import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { connection } from './src/database/db';

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: connection.host,
    port: connection.port,
    user: connection.user,
    password: connection.password,
    database: connection.database,
    ssl: connection.ssl
  },
});

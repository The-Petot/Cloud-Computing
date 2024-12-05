import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnv } from '../libs/index';

export const connection =
  getEnv('NODE_ENV') === 'production'
    ? {
        user: getEnv('DB_USER_PROD'),
        host: getEnv('DB_HOST_PROD'),
        database: getEnv('DB_NAME_PROD'),
        password: getEnv('DB_PASSWORD_PROD'),
        port: parseInt(getEnv('DB_PORT_PROD')),
        ssl: false,
      }
    : {
        user: getEnv('DB_USER_DEV'),
        host: getEnv('DB_HOST_DEV'),
        database: getEnv('DB_NAME_DEV'),
        password: getEnv('DB_PASSWORD_DEV'),
        port: parseInt(getEnv('DB_PORT_DEV')),
        ssl: false,
      };

const pool = new Pool(connection);

const db = drizzle({ client: pool });

export default db;

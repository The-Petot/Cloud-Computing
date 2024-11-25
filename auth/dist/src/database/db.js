import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnv } from '../utils';
const pool = new Pool({
    user: getEnv('DB_USER'),
    host: getEnv('DB_HOST'),
    database: getEnv('DB_NAME'),
    password: getEnv('DB_PASSWORD'),
    port: parseInt(getEnv('DB_PORT'))
});
const db = drizzle({
    client: pool
});
export default db;

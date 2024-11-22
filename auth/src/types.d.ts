export interface ExtendedEnv extends Bun.env {
  HOST: string;
  PORT: string;
  NODE_ENV: string;
  DB_URL: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: string;
  JWT_SECRET: string
  REDIS_URL_DEV: string;
  REDIS_URL_PROD: string;
}

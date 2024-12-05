export interface ExtendedEnv extends Bun.env {
  HOST: string;
  PORT: string;
  NODE_ENV: string;

  DB_USER_PROD: string;
  DB_PASSWORD_PROD: string;
  DB_NAME_PROD: string;
  DB_HOST_PROD: string;
  DB_PORT_PROD: string;

  DB_USER_DEV: string;
  DB_PASSWORD_DEV: string;
  DB_NAME_DEV: string;
  DB_HOST_DEV: string;
  DB_PORT_DEV: string;

  JWT_SECRET: string
  REDIS_URL_DEV: string;
  REDIS_URL_PROD: string;
  TEST: string
}

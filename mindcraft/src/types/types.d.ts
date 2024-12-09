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
  JWT_SECRET: string;
  REDIS_URL_DEV: string;
  REDIS_URL_PROD: string;
  QUESTION_MODEL_URL: string;
  SUMMARY_MODEL_URL: string;
  PATH_TO_SERVICEACCOUNTKEY: string;
  BUCKET_NAME: string;
  TEST: string;
  PUBSUB_TOPIC_ML_GENERATE: string;
  PUBSUB_TOPIC_ML_SUMMARY: string;
  PUBSUB_TOPIC_ML_RESULTS: string;
}

import { Elysia, t } from 'elysia';
import { getEnv, setError } from './utils';
import { cors } from '@elysiajs/cors';
import { logger } from '@bogeychan/elysia-logger';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import userRouter from './routes/user.route';
import challengeRouter from './routes/challenge.route';
import participationRouter from './routes/participation.route';
import { listenForMessages } from './pub-sub/pubsub';
import { PubSubResult } from './types/global.type';
import { PubSub } from '@google-cloud/pubsub';
config();

export const pubSubClient = new PubSub({
  keyFilename: getEnv('PATH_TO_SERVICEACCOUNTKEY'),
});
export const tasks = new Map<string, PubSubResult>();
const redis = await import('./database/redis').then((m) => m.default);

listenForMessages(tasks).catch(console.error);

const app = new Elysia({
  serve: {
    hostname:
      getEnv('NODE_ENV') === 'production' ? getEnv('HOST') : 'localhost',
  },
})
  .use(cors({ origin: '*' }))
  .use(
    logger({
      autoLogging: true,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    })
  )
  .decorate('redis', redis)
  .decorate('bcrypt', bcrypt)
  .decorate('uuid', uuidv4)
  .derive(({ request }) => {
    const accessToken =
      request.headers.get('Authorization')?.split(' ')[1] ?? null;
    const refreshToken = request.headers.get('X-Refresh-Token') ?? null;
    const sessionId = request.headers.get('X-Session-Id') ?? null;
    return {
      accessToken,
      refreshToken,
      sessionId,
    };
  })
  .use(userRouter)
  .use(challengeRouter)
  .use(participationRouter)
  .listen(
    getEnv('NODE_ENV') === 'production' ? parseInt(getEnv('PORT'), 10) : 3001,
    () => console.log('Server is running on port :' + (getEnv('PORT') || 3001))
  );

export default app;

import { Elysia } from 'elysia';
import { getEnv } from './utils';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { logger } from '@bogeychan/elysia-logger';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import swagger from '@elysiajs/swagger';
import { config } from 'dotenv';
import userRouter from './routes/user.route';
config();
const redis = await import('./database/redis').then((m) => m.default);
const app = new Elysia({
  serve: {
    hostname:
      getEnv('NODE_ENV') === 'production' ? getEnv('HOST') : 'localhost',
  },
})
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Mindcraft Service',
          description: "This is the Mindcraft's main service",
          version: '1.0.0',
        },
      },
      path: '/docs',
    })
  )
  .use(jwt({ secret: getEnv('JWT_SECRET'), name: 'jwt' }))
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
    const accessToken = request.headers.get('Authorization')?.split(' ')[1] ?? null;
    const refreshToken = request.headers.get('X-Refresh-Token') ?? null;
    const sessionId = request.headers.get('X-Session-Id') ?? null;
    return {
      accessToken,
      refreshToken,
      sessionId,
    };
  })
  .use(userRouter)
  .listen(
    getEnv('NODE_ENV') === 'production' ? parseInt(getEnv('PORT'), 10) : 3001
  );

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export default app;

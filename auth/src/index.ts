import { Elysia, t } from 'elysia';
import { getEnv } from './utils';
import authRouter from './routes/auth.route';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { logger } from '@bogeychan/elysia-logger';
import redis from './database/redis';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import swagger from '@elysiajs/swagger';

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
          title: 'Authentication Service',
          description: 'This is the authentication service for Mindcraft',
          version: '1.0.0',
        },
      },
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
  .use(authRouter)
  .listen(
    getEnv('NODE_ENV') === 'production' ? parseInt(getEnv('PORT'), 10) : 3001
  );

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export default app;

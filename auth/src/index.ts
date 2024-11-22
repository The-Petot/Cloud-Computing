import { Elysia } from 'elysia';
import { getEnv } from './utils';
import authRouter from './routes/auth.route';
import { jwt } from '@elysiajs/jwt';

const app = new Elysia({
  serve: {
    hostname:
      getEnv('NODE_ENV') === 'production' ? getEnv('HOST') : 'localhost',
  },
  prefix: '/api/auth',
})
  .use(jwt({ secret: getEnv('JWT_SECRET'), name: 'jwt' }))
  .use(authRouter)
  .listen(
    getEnv('NODE_ENV') === 'production' ? parseInt(getEnv('PORT'), 10) : 3001
  );

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export default app;

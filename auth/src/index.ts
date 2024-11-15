import { Elysia } from 'elysia';
import { getEnv } from './utils';
import userRouter from './routes/user.route';

const app = new Elysia({
  serve: {
    hostname: getEnv('HOST') === 'production' ? getEnv('HOST') : 'localhost',
  },
  prefix: '/api/auth',
})
  .get('/', () => 'Welcome to auth services')
  .use(userRouter)
  .listen(
    Bun.env.NODE_ENV === 'production' ? parseInt(getEnv('PORT'), 10) : 3001
  );

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export default app;

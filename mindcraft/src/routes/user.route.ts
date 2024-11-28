import { Elysia, t } from 'elysia';
import { handleGetUserById } from '../controllers/user.controller';

const userRouter: Elysia = new Elysia()
.get('/users/:userId', handleGetUserById)
// .get('/users', handleGetUsers)

export default userRouter;

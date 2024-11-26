import { Elysia, t } from 'elysia';
import { handleGetUserById, handleGetUsers } from '../controllers/user.controller';

const userRouter: Elysia = new Elysia()
.get('/users/:id', handleGetUserById)
.get('/users', handleGetUsers)

export default userRouter;

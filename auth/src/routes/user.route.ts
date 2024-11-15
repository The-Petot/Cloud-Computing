import { Elysia } from 'elysia';
import { handleUserRegister } from '../controllers/user.controller';

const userRouter: Elysia = new Elysia().post('/register', handleUserRegister);

export default userRouter;

import { Elysia } from 'elysia';
import { handleUserRegister, handleUserLogin, handleUserLogout, handleTokenRefresh } from '../controllers/auth.controller';

const authRouter: Elysia = new Elysia()
.post('/register', handleUserRegister)
.post('/login', handleUserLogin)
.post('/logout', handleUserLogout)
.post('/refresh', handleTokenRefresh)

export default authRouter;

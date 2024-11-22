import { Elysia } from 'elysia';
import { handleUserRegister, handleUserLogin, handleTokenRefresh, handleUserLogout } from '../controllers/auth.controller';

const authRouter: Elysia = new Elysia()
.post('/register', handleUserRegister)
.post('/login', handleUserLogin)
.post('/refresh', handleTokenRefresh)
.post('/logout', handleUserLogout)

export default authRouter;

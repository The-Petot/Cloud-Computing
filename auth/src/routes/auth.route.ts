import { Elysia } from 'elysia';
import {
  handleUserRegister,
  handleUserLogin,
  handleTokenRefresh,
  handleUserLogout,
  handleToggleTwoFactor,
  handleGoogleOAuth
} from '../controllers/auth.controller';

const authRouter: Elysia = new Elysia()
  .post('/register', handleUserRegister)
  .post('/login', handleUserLogin)
  .post('/refresh', handleTokenRefresh)
  .post('/logout', handleUserLogout)
  .put('/two-factor', handleToggleTwoFactor)
  .post('/oauth/google', handleGoogleOAuth)
  

export default authRouter;

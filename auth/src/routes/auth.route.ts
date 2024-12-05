import { Elysia } from 'elysia';
import {
  handleUserRegister,
  handleUserLogin,
  handleTokenRefresh,
  handleUserLogout,
  handleToggleTwoFactor,
  handleGoogleOAuth,
  handleGetTwoFactorQR
} from '../controllers/auth.controller';

const authRouter: Elysia = new Elysia()
  .post('/register', handleUserRegister)
  .post('/login', handleUserLogin)
  .post('/refresh', handleTokenRefresh)
  .post('/logout', handleUserLogout)
  .post('/oauth/google', handleGoogleOAuth)
  .put('/two-factor', handleToggleTwoFactor)
  .get('/two-factor', handleGetTwoFactorQR)
  

export default authRouter;

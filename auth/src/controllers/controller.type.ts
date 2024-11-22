import { InferHandler } from 'elysia';
import app from '../index';
import { usersTable } from '../database/schema';

interface JSONErrorResponse {
  error: string;
}

interface JSONSuccessResponse<T> {
  data: T;
  message: string;
}

export type User = typeof usersTable.$inferInsert;
export type HandleUserRegister = InferHandler<
  typeof app,
  '/register',
  {
    body: User;
    response: {
      201: JSONSuccessResponse<{
        userId: number;
      }>;
      400: JSONErrorResponse;
      409: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUserLogin = InferHandler<
  typeof app,
  '/login',
  {
    body: { email: string; password: string };
    response: {
      200: JSONSuccessResponse<{ userId: number }>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUserLogout = InferHandler<
  typeof app,
  '/logout'
>

export type HandleTokenRefresh = InferHandler<
  typeof app,
  '/refresh',
  {
    body: { refreshToken: string };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>
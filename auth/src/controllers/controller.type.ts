import { InferHandler } from 'elysia';
import app from '../index';
import { User } from '../global.types';
import { registerDto } from '../dtos/auth.dtos';

interface JSONErrorResponse {
  error: string;
}

interface JSONSuccessResponse<T> {
  data?: T;
  message: string;
}


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
  '/logout',
  {
    body: { userId: number };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>

export type HandleTokenRefresh = InferHandler<
  typeof app,
  '/refresh',
  {
    body: { userId: number };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>